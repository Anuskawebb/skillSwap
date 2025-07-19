"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import type { StepProps } from "@/types/onboarding";
import { useState } from "react";

const coreLearningSkills = [
  "New Language",
  "Coding Fundamentals",
  "Graphic Design",
  "Financial Literacy",
  "Photography",
  "Public Speaking",
  "Digital Marketing",
  "Video Editing",
  "Music Production",
  "Cooking",
  "Fitness Training",
  "Data Science",
  "Machine Learning",
  "UX/UI Design",
  "Creative Writing",
  "Business Strategy",
];

export default function SkillsToLearnStep({
  formData,
  setFormData,
  onNext,
  onPrev,
}: StepProps) {
  const [manualSkill, setManualSkill] = useState("");

  const addSkill = (skillName: string) => {
    if (formData.learningGoals.includes(skillName)) {
      toast.info(`${skillName} is already in your learning goals`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      learningGoals: [...prev.learningGoals, skillName],
    }));
  };

  const addManualSkill = () => {
    const trimmedSkill = manualSkill.trim();

    if (trimmedSkill) {
      addSkill(trimmedSkill);
      setManualSkill("");
    } else {
      toast.error("Please enter a skill name.");
    }
  };

  const removeSkill = (skillName: string) => {
    setFormData((prev) => ({
      ...prev,
      learningGoals: prev.learningGoals.filter((skill) => skill !== skillName),
    }));
  };

  const handleNext = () => {
    if (formData.learningGoals.length === 0) {
      toast.error("Please select at least one skill you want to learn");
      return;
    }
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-black">
          What skills would you love to master?
        </h2>
        <p className="text-gray-600 font-medium">
          Select at least one skill you want to learn
        </p>
      </div>

      <Card className="border-2 border-black shadow-lg">
        <CardContent className="p-6 space-y-6">
          {/* Popular Learning Skills */}
          <div className="space-y-4">
            <Label className="text-black font-bold">
              Popular Learning Goals
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {coreLearningSkills.map((skill) => (
                <Button
                  key={skill}
                  variant={
                    formData.learningGoals.includes(skill)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => addSkill(skill)}
                  className={`justify-start text-left h-auto p-3 border-2 font-medium ${
                    formData.learningGoals.includes(skill)
                      ? "bg-blue-400 text-white border-black"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>

          {/* Manually Add Skill */}
          <div className="space-y-4">
            <Label className="text-black font-bold">
              Add Your Own Learning Goal
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter a skill you want to learn (e.g., Piano, French, Blockchain)"
                value={manualSkill}
                onChange={(e) => setManualSkill(e.target.value)}
                className="border-2 border-gray-300 rounded-lg font-medium flex-grow"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addManualSkill();
                  }
                }}
              />
              <Button
                onClick={addManualSkill}
                className="bg-gray-200 hover:bg-gray-300 text-black font-bold"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Selected Learning Goals */}
          {formData.learningGoals.length > 0 && (
            <div className="space-y-4">
              <Label className="text-black font-bold">
                Your Learning Goals ({formData.learningGoals.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {formData.learningGoals.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-100 border-2 border-blue-300 rounded-lg"
                  >
                    <span className="font-medium text-black">{skill}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(skill)}
                      className="h-auto p-1 text-red-600 hover:text-red-800 hover:bg-red-100"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.learningGoals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Select or add skills you want to learn to continue</p>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              onClick={onPrev}
              variant="outline"
              className="border-2 border-gray-300 bg-transparent"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
