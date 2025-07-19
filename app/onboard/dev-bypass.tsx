"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowRight, User, Settings } from "lucide-react";

export default function DevBypass() {
  const router = useRouter();

  const createTestUser = async () => {
    try {
      // Create a test user for development
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          clerkId: "test_" + Date.now(),
        }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to create test user:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="border-2 border-black shadow-lg max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
            <Settings className="w-8 h-8 text-black" />
          </div>
          <CardTitle className="text-2xl font-black">
            Development Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            Authentication is not configured. You can test the onboarding flow
            with a demo user.
          </p>

          <div className="space-y-3">
            <Button
              onClick={createTestUser}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
            >
              <User className="w-4 h-4 mr-2" />
              Create Test User & Continue
            </Button>

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full border-2 border-gray-300"
            >
              Back to Home
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center pt-4 border-t">
            <p>To use real authentication:</p>
            <p>1. Configure Clerk environment variables</p>
            <p>2. Set up your database connection</p>
            <p>3. Restart the development server</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
