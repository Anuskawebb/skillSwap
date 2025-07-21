import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-sdk";


export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();
    

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Stream API key or secret not set" },
        { status: 500 },
      );
    }

    // Initialize the Stream server client
    const client = new StreamVideoClient(apiKey, apiSecret);

    // Tokens should have an expiration time
    const exp = Math.round(new Date().getTime() / 1000) + 60 * 60; // 1 hour
    const issued = Math.floor(Date.now() / 1000) - 60;

    // Create a token for the user
    const token = client.createToken(userId, exp, issued);

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 },
    );
  }
}
