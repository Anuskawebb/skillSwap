"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import WelcomeStep from "./welcome-step";
import BasicInfoStep from "./basic-info-step";
import AboutYouStep from "./about-you-step";
import SkillsToTeachStep from "./skills-to-teach-step";
import SkillsToLearnStep from "./skills-to-learn-step";
import PreferencesStep from "./preferences-step";
import WalletConnect from "@/components/wallet-connect";

import type { FormData } from "@/types/onboarding";

export default function OnboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    username: "",
    bio: "",
    avatarUrl: "",
    interests: [],
    socialLinks: {},
    occupation: "",
    location: "",
    timezone: "",
    age: 0,
    preferredLanguages: [],
    skillsOffered: [],
    learningGoals: [],
    userIntent: [],
    userAvailability: [],
    walletAddress: "",
    walletSignature: "",
  });

  const totalSteps = 7;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Check if user already exists and initialize form data
  useEffect(() => {
    const checkUserExists = async () => {
      try {
        // Wait for Clerk to load
        if (!isLoaded) return;

        // If no user, show welcome anyway for testing
        if (!user) {
          console.warn(
            "No authenticated user found, proceeding with demo mode",
          );
          setFormData((prev) => ({
            ...prev,
            displayName: "Demo User",
            avatarUrl: "/placeholder.svg",
          }));
          setIsCheckingUser(false);
          return;
        }

        const response = await fetch("/api/user");
        const data = await response.json();

        if (data.user && data.user.hasOnboarded) {
          router.push("/dashboard");
          return;
        }

        // Initialize form data with user info
        setFormData((prev) => ({
          ...prev,
          displayName: user?.fullName || data.user?.name || "",
          username: data.user?.username || "",
          avatarUrl: user?.imageUrl || data.user?.avatarUrl || "",
        }));
      } catch (error) {
        console.error("Error checking user:", error);
        // Initialize with basic user data even if API fails
        if (user) {
          setFormData((prev) => ({
            ...prev,
            displayName: user?.fullName || "",
            avatarUrl: user?.imageUrl || "",
          }));
        }
      } finally {
        setIsCheckingUser(false);
      }
    };

    checkUserExists();
  }, [user, isLoaded, router]);

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleWalletConnected = (walletData: {
    address: string;
    signature: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      walletAddress: walletData.address,
      walletSignature: walletData.signature,
    }));

    setTimeout(() => {
      completeOnboarding(walletData);
    }, 1000);
  };

  const completeOnboarding = async (walletData?: {
    address: string;
    signature: string;
  }) => {
    const finalData = walletData
      ? {
          ...formData,
          walletAddress: walletData.address,
          walletSignature: walletData.signature,
        }
      : formData;

    // Basic validation
    if (!finalData.displayName.trim()) {
      toast.error("Please enter your display name");
      setCurrentStep(1);
      return;
    }
    if (!finalData.occupation) {
      toast.error("Please select your occupation");
      setCurrentStep(2);
      return;
    }
    if (finalData.skillsOffered.length === 0) {
      toast.error("Please select at least one skill you can teach");
      setCurrentStep(3);
      return;
    }
    if (finalData.learningGoals.length === 0) {
      toast.error("Please select at least one skill you want to learn");
      setCurrentStep(4);
      return;
    }
    if (!finalData.walletAddress || !finalData.walletSignature) {
      toast.error("Please connect your wallet to continue");
      setCurrentStep(6);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Map form data to match Prisma User model exactly
          name: finalData.displayName,
          username: finalData.username || "",
          bio: finalData.bio || null,
          avatarUrl: finalData.avatarUrl || null,
          occupation: finalData.occupation,
          location: finalData.location || null,
          timezone: finalData.timezone,
          age: Number(finalData.age) || 0,
          walletAddress: finalData.walletAddress || null,

          // Array fields
          interests: Array.isArray(finalData.interests)
            ? finalData.interests.filter(Boolean)
            : [],
          preferredLanguages: Array.isArray(finalData.preferredLanguages)
            ? finalData.preferredLanguages.filter(Boolean)
            : [],
          skillsOffered: Array.isArray(finalData.skillsOffered)
            ? finalData.skillsOffered
                .map((s) => (typeof s === "string" ? s : s.name || String(s)))
                .filter(Boolean)
            : [],
          learningGoals: Array.isArray(finalData.learningGoals)
            ? finalData.learningGoals
                .map((s) => (typeof s === "string" ? s : s.name || String(s)))
                .filter(Boolean)
            : [],
          userIntent: Array.isArray(finalData.userIntent)
            ? finalData.userIntent.filter(Boolean)
            : [],
          userAvailability: Array.isArray(finalData.userAvailability)
            ? finalData.userAvailability.filter(Boolean)
            : [],

          // JSON field
          socialLinks:
            finalData.socialLinks && typeof finalData.socialLinks === "object"
              ? finalData.socialLinks
              : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Welcome to SkillSwap! Your on-chain learning identity is ready! 🎉",
        );
        router.push("/dashboard");
      } else {
        // Handle specific error codes
        switch (data.code) {
          case "ALREADY_ONBOARDED":
            toast.info("You've already completed onboarding!");
            router.push("/dashboard");
            break;
          case "WALLET_ALREADY_CONNECTED":
            toast.error("This wallet is already connected to another account.");
            setFormData((prev) => ({
              ...prev,
              walletAddress: "",
              walletSignature: "",
            }));
            setCurrentStep(6);
            break;
          case "USERNAME_TAKEN":
            toast.error("Username is already taken. Please choose another.");
            setCurrentStep(1);
            break;
          case "VALIDATION_ERROR":
            toast.error("Please check your form data and try again.");
            console.error("Validation errors:", data.errors);
            break;
          default:
            toast.error(
              data.error || "Failed to complete onboarding. Please try again.",
            );
        }
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error(
        "Network error occurred. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black animate-pulse">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="w-8 h-8 border-2 border-black border-t-transparent rounded-full"
            />
          </div>
          <p className="text-gray-600 font-medium">Checking your profile...</p>
        </div>
      </div>
    );
  }

  const steps = [
    <WelcomeStep key="welcome" onNext={nextStep} />,
    <BasicInfoStep
      key="basic-info"
      formData={formData}
      setFormData={setFormData}
      onNext={nextStep}
      onPrev={prevStep}
    />,
    <AboutYouStep
      key="about-you"
      formData={formData}
      setFormData={setFormData}
      onNext={nextStep}
      onPrev={prevStep}
    />,
    <SkillsToTeachStep
      key="skills-teach"
      formData={formData}
      setFormData={setFormData}
      onNext={nextStep}
      onPrev={prevStep}
    />,
    <SkillsToLearnStep
      key="skills-learn"
      formData={formData}
      setFormData={setFormData}
      onNext={nextStep}
      onPrev={prevStep}
    />,
    <PreferencesStep
      key="preferences"
      formData={formData}
      setFormData={setFormData}
      onNext={nextStep}
      onPrev={prevStep}
    />,
    <motion.div
      key="wallet"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl font-black text-black">Connect Your Wallet</h2>
        <p className="text-gray-600 font-medium">
          Secure your profile and enable Web3 features
        </p>
      </div>
      <WalletConnect
        onWalletConnected={handleWalletConnected}
        isLoading={isSubmitting}
      />

      {/* Testing Submit Button */}
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-4">
          <div className="text-sm text-gray-500 mb-4">
            For testing purposes:
          </div>
          <Button
            onClick={() => completeOnboarding()}
            disabled={isSubmitting}
            variant="outline"
            className="border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
          >
            {isSubmitting
              ? "Submitting..."
              : "Skip Wallet & Submit for Testing"}
          </Button>
        </div>
      </div>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-3 border border-black" />
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">{steps[currentStep]}</AnimatePresence>

        {/* Navigation for non-component steps */}
        {currentStep > 0 && currentStep < totalSteps - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-between items-center mt-8"
          >
            <Button
              onClick={prevStep}
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={nextStep}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
