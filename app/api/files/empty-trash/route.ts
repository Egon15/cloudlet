import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import ImageKit from "imagekit";

// Initialize ImageKit with environment credentials
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

export async function DELETE() {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all trashed files for the authenticated user
    const trashedFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)));

    if (trashedFiles.length === 0) {
      return NextResponse.json(
        { message: "No files trashed" },
        { status: 200 }
      );
    }

    // Delete non-folder files from ImageKit
    const deletePromises = trashedFiles
      .filter((file) => !file.isFolder)
      .map(async (file) => {
        try {
          let imagekitFileId;

          // Try extracting file ID from fileUrl or fallback to path
          if (file.fileUrl) {
            const urlWithoutQuery = file.fileUrl.split("?")[0];
            imagekitFileId = urlWithoutQuery.split("/").pop();
          }

          if (!imagekitFileId && file.path) {
            imagekitFileId = file.path.split("/").pop();
          }

          // Attempt to find and delete the file from ImageKit
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
              console.error("ImageKit search error:", searchError);
              // Fallback to direct delete
              await imagekit.deleteFile(imagekitFileId);
            }
          }
        } catch (error) {
          console.error(
            `Failed to delete file ${file.id} from ImageKit:`,
            error
          );
        }
      });

    // Wait for all ImageKit deletions to finish
    await Promise.allSettled(deletePromises);

    // Delete all trashed files from the database
    const deletedFiles = await db
      .delete(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)))
      .returning();

    // Respond with success and count of deleted files
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedFiles.length} files from trash`,
    });
  } catch (error) {
    console.error("Error in emptying trash-bin:", error);
    return NextResponse.json(
      { error: "Failed to empty trash" },
      { status: 500 }
    );
  }
}
