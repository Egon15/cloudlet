import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import ImageKit from "imagekit";

// Initialize ImageKit with credentials from environment variables
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ fileId: string }> }
) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract fileId from route params
    const { fileId } = await props.params;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Fetch the file from the database, ensuring it belongs to the user
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // If it's not a folder, try to delete from ImageKit
    if (!file.isFolder) {
      try {
        let imagekitFileId = null;

        // Extract file identifier from URL or path
        if (file.fileUrl) {
          const urlWithoutQuery = file.fileUrl.split("?")[0];
          imagekitFileId = urlWithoutQuery.split("/").pop();
        }

        if (!imagekitFileId && file.path) {
          imagekitFileId = file.path.split("/").pop();
        }

        // Try deleting the file from ImageKit
        if (imagekitFileId) {
          try {
            const searchResults = await imagekit.listFiles({
              name: imagekitFileId,
              limit: 1,
            });

            if (searchResults && searchResults.length > 0) {
              await imagekit.deleteFile(searchResults[0].name);
            } else {
              await imagekit.deleteFile(imagekitFileId);
            }
          } catch (searchError) {
            console.error(`Error searching for file in ImageKit:`, searchError);
            // Attempt direct deletion if search fails
            await imagekit.deleteFile(imagekitFileId);
          }
        }
      } catch (error) {
        console.error(`Error deleting file ${fileId} from ImageKit:`, error);
      }
    }

    // Delete the file record from the database
    const [deletedFile] = await db
      .delete(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    // Return success response
    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
      deletedFile,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
