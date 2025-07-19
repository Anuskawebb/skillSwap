import { type NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { validateCompleteForm } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Onboarding data received:", body);

    // Validate the form data
    const validationErrors = validateCompleteForm(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          errors: validationErrors,
        },
        { status: 400 },
      );
    }

    // Check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          error: "User not found. Please try signing up again.",
          code: "USER_NOT_FOUND",
        },
        { status: 404 },
      );
    }

    if (existingUser.hasOnboarded) {
      return NextResponse.json(
        {
          error: "User has already completed onboarding",
          code: "ALREADY_ONBOARDED",
        },
        { status: 400 },
      );
    }

    // Check if username is taken (if username is being updated)
    if (body.username && body.username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username: body.username },
      });

      if (usernameExists) {
        return NextResponse.json(
          { error: "Username is already taken", code: "USERNAME_TAKEN" },
          { status: 400 },
        );
      }
    }

    // Check if wallet address is already connected to another user
    if (body.walletAddress) {
      const walletExists = await prisma.user.findFirst({
        where: {
          walletAddress: body.walletAddress,
          clerkId: { not: userId }, // Exclude current user
        },
      });

      if (walletExists) {
        return NextResponse.json(
          {
            error: "This wallet is already connected to another account",
            code: "WALLET_ALREADY_CONNECTED",
          },
          { status: 400 },
        );
      }
    }

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        name: body.name,
        username: body.username,
        bio: body.bio || null,
        avatarUrl: body.avatarUrl || existingUser.avatarUrl,
        interests: body.interests || [],
        socialLinks: body.socialLinks || {},
        preferredLanguages: body.preferredLanguages || [],
        occupation: body.occupation,
        location: body.location || null,
        timezone: body.timezone,
        age: body.age,
        skillsOffered: body.skillsOffered || [],
        learningGoals: body.learningGoals || [],
        userIntent: body.userIntent || [],
        userAvailability: body.userAvailability || [],
        walletAddress: body.walletAddress || null,
        hasOnboarded: true,
      },
    });

    console.log("User onboarding completed:", updatedUser.id);

    return NextResponse.json(
      {
        message: "Onboarding completed successfully",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("ONBOARDING_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 },
    );
  }
}

// Check if user exists endpoint
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    console.log(userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { exists: false, onboarded: false, user: null },
        { status: 200 },
      );
    }

    // If user exists, return user data
    console.log("Existing user found:", existingUser);

    if (existingUser && existingUser.hasOnboarded) {
      return NextResponse.json(
        { exists: true, onboarded: true, user: existingUser },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { exists: true, onboarded: false, user: existingUser },
      { status: 200 },
    );
  } catch (error) {
    console.error("USER_CHECK_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to check user status" },
      { status: 500 },
    );
  }
}
