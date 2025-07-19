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

    // Transform and clean the data according to Prisma schema
    const updateData = {
      // Required fields
      name: body.name || body.displayName,
      username: body.username,
      occupation: body.occupation,
      timezone: body.timezone,
      age: Number(body.age),

      // Optional fields - use null for empty strings to match schema
      bio: body.bio && body.bio.trim() ? body.bio.trim() : null,
      avatarUrl:
        body.avatarUrl && body.avatarUrl.trim()
          ? body.avatarUrl.trim()
          : existingUser.avatarUrl,
      location:
        body.location && body.location.trim() ? body.location.trim() : null,
      walletAddress:
        body.walletAddress && body.walletAddress.trim()
          ? body.walletAddress.trim()
          : null,

      // Array fields - ensure they are arrays
      interests: Array.isArray(body.interests)
        ? body.interests.filter(Boolean)
        : [],
      preferredLanguages: Array.isArray(body.preferredLanguages)
        ? body.preferredLanguages.filter(Boolean)
        : [],
      skillsOffered: Array.isArray(body.skillsOffered)
        ? body.skillsOffered
            .map((s: any) => (typeof s === "string" ? s : s.name || String(s)))
            .filter(Boolean)
        : [],
      learningGoals: Array.isArray(body.learningGoals)
        ? body.learningGoals
            .map((s: any) => (typeof s === "string" ? s : s.name || String(s)))
            .filter(Boolean)
        : [],
      userIntent: Array.isArray(body.userIntent)
        ? body.userIntent.filter(Boolean)
        : [],
      userAvailability: Array.isArray(body.userAvailability)
        ? body.userAvailability.filter(Boolean)
        : [],

      // JSON field
      socialLinks:
        body.socialLinks && typeof body.socialLinks === "object"
          ? body.socialLinks
          : null,

      // Mark as onboarded
      hasOnboarded: true,
    };

    console.log("Transformed data for database:", updateData);

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: updateData,
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
