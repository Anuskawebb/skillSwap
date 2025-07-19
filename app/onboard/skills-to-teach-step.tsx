"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";
import type { StepProps } from "@/types/onboarding";
import { useState } from "react";

const coreSkills = [
  "Programming",
  "Web Development",
  "Design",
  "Marketing",
  "Writing",
  "Data Analysis",
  "Project Management",
  "Public Speaking",
  "Language Teaching",
  "Music",
  "Cooking",
  "Photography",
  "Video Editing",
  "Social Media",
  "Accounting",
  "Sales",
];

export default function SkillsToTeachStep({
  formData,
  setFormData,
  onNext,
  onPrev,
}: StepProps) {
  const [manualSkill, setManualSkill] = useState("");

  const addSkill = (skillName: string) => {
    if (formData.skillsOffered.includes(skillName)) {
      toast.info(`${skillName} is already in your teaching skills`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      skillsOffered: [...prev.skillsOffered, skillName],
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
      skillsOffered: prev.skillsOffered.filter((skill) => skill !== skillName),
    }));
  };

  const handleNext = () => {
    if (formData.skillsOffered.length === 0) {
      toast.error("Please select at least one skill you can teach");
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
          What skills could you share with the world?
        </h2>
        <p className="text-gray-600 font-medium">
          Select at least one skill you can teach others
        </p>
      </div>

      <Card className="border-2 border-black shadow-lg">
        <CardContent className="p-6 space-y-6">
          {/* Popular Skills */}
          <div className="space-y-4">
            <Label className="text-black font-bold">Popular Skills</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {coreSkills.map((skill) => (
                <Button
                  key={skill}
                  variant={
                    formData.skillsOffered.includes(skill)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => addSkill(skill)}
                  className={`justify-start text-left h-auto p-3 border-2 font-medium ${
                    formData.skillsOffered.includes(skill)
                      ? "bg-green-400 text-white border-black"
                      : "border-gray-300 hover:border-green-400 hover:bg-green-50"
                  }`}
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>

          {/* Manually Add Skill */}
          <div className="space-y-4">
            <Label className="text-black font-bold">Add Your Own Skill</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter a skill (e.g., Chess, Public Speaking, Guitar)"
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

          {/* Selected Teaching Skills */}
          {formData.skillsOffered.length > 0 && (
            <div className="space-y-4">
              <Label className="text-black font-bold">
                Your Teaching Skills ({formData.skillsOffered.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {formData.skillsOffered.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 px-3 py-2 bg-green-100 border-2 border-green-300 rounded-lg"
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

          {formData.skillsOffered.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Select or add skills you can teach to continue</p>
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
