import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { imagekit, userId: bodyUserId } = body;

    // Ensure the request is made for the authenticated user's account
    if (bodyUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate presence of ImageKit upload data
    if (!imagekit || !imagekit.url) {
      return NextResponse.json(
        { error: "Invalid file upload data" },
        { status: 400 }
      );
    }

    // Build file record using ImageKit response
    const fileData = {
      name: imagekit.name || "Untitled",
      path: imagekit.filePath || `/cloudlet/${userId}/${imagekit.name}`,
      size: imagekit.size || 0,
      type: imagekit.fileType || "image",
      fileUrl: imagekit.url,
      thumbnailUrl: imagekit.thumbnailUrl || null,
      userId: userId,
      parentId: null, // Default to root
      isFolder: false,
      isStarred: false,
      isTrash: false,
    };

    // Save file metadata to database
    const [newFile] = await db.insert(files).values(fileData).returning();

    // Return saved file data
    return NextResponse.json(newFile);
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json(
      { error: "Failed to save file information" },
      { status: 500 }
    );
  }
}
