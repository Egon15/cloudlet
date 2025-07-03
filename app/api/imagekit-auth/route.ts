import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import ImageKit from "imagekit";

// Initialize ImageKit SDK with credentials
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

export async function GET() {
  try {
    // Authenticate the user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate ImageKit auth parameters for frontend uploads
    const authParams = imagekit.getAuthenticationParameters();

    // Send auth params as response
    return NextResponse.json(authParams);
  } catch (error: unknown) {
    // Handle failure in auth param generation
    return NextResponse.json(
      error || {
        error: "Failed to generate authentication parameters for imagekit",
      },
      { status: 501 }
    );
  }
}
