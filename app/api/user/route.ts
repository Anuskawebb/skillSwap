import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  const {userId: clerkId} = await auth();
  console.log("User Id from Clerk:", clerkId);

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
     
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authentication details from Clerk
    const { userId} =await auth();
    const clerkUser = await currentUser(); // Get the full Clerk user object

    // If no userId, the user is not authenticated
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Check if the user already exists in your database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (existingUser) {
      // If user exists, return their data and a flag indicating existence
      return NextResponse.json(
        { exists: true, user: existingUser, message: "User already exists in DB." },
        { status: 200 },
      );
    }
     const generatedUsername = await generateUniqueUsername(clerkUser?.fullName);
    // If the user does not exist in your database, create a new record
    const newUser = await prisma.user.create({
      data: {
        clerkId: userId,
        // Populate fields from the Clerk user object
        name: clerkUser?.fullName || "", // Use fullName, provide fallback
        email: clerkUser?.emailAddresses?.[0]?.emailAddress || null, // Safely access email
        username: generatedUsername, // Use the generated unique username
        avatarUrl: clerkUser?.imageUrl || null, // Use imageUrl
        hasOnboarded: false, // Set to false initially for onboarding flow
      },
    });

    // Return the newly created user with a 201 Created status
    return NextResponse.json(
      { exists: false, user: newUser, message: "New user created successfully." },
      { status: 201 },
    );

  } catch (error) {
    console.error("Error in POST /api/user (user creation/check):", error);
    return NextResponse.json(
      { error: "Internal server error during user operation." },
      { status: 500 },
    );
  }
}


async function generateUniqueUsername(fullName: string | null | undefined): Promise<string> {
  // 1. Sanitize the full name to create a base username
  let baseUsername = "user"; // Default if fullName is not available
  if (fullName) {
    baseUsername = fullName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters (except spaces and hyphens)
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  if (!baseUsername) {
    baseUsername = "user"; // Fallback if sanitization results in an empty string
  }

  let username = baseUsername;
  let counter = 0;

  // 2. Check for uniqueness and append a number if necessary
  while (true) {
    const existingUser = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!existingUser) {
      // Username is unique, break the loop
      break;
    }

    // Username exists, try appending a number
    counter++;
    username = `${baseUsername}-${counter}`;
  }

  return username;
}