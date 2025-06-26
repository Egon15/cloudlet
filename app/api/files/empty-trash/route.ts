import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import ImageKit from "imagekit";

// Initializing ImageKit with credentials
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all the files that are trashed by the user
    const trashedFiles = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)));

    if (trashedFiles.length === 0) {
      return NextResponse.json(
        {
          message: "No files trashed",
        },
        { status: 200 }
      );
    }

    // Empty the trash i.e. Delete the file from the ImageKit
    const deletePromises = trashedFiles
      .filter((file) => !file.isFolder)
      .map(async (file) => {
        try {
          let imagekitFieldId = undefined;

          if (file.fileUrl) {
            const urlWithoutQuery = file.fileUrl.split("?")[0];
            imagekitFieldId = urlWithoutQuery.split("/").pop();
          }

          if (imagekitFieldId && file.path) {
            imagekitFieldId = file.path.split("/").pop();
          }

          if (imagekitFieldId) {
            try {
              const searchResults = await imagekit.listFiles({
                name: imagekitFieldId,
                limit: 1,
              });

              if (searchResults && searchResults.length > 0) {
                await imagekit.deleteFile(searchResults[0].name);
              } else {
                await imagekit.deleteFile(imagekitFieldId);
              }
            } catch (searchError) {
              console.error(
                `Error searching for the file in ImageKit:`,
                searchError
              );
              await imagekit.deleteFile(imagekitFieldId);
            }
          }
        } catch (error) {
          console.error(
            `Error deleting file ${file.id} from ImageKit: `,
            error
          );
        }
      });

    // Wait for the deletion operation to compelete on the ImageKit side
    await Promise.allSettled(deletePromises);

    // Delete all the trashed files from the database
    const deletedFiles = await db
      .delete(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedFiles.length} files from trash`,
    });
  } catch (error) {
    console.error("Error in emptying trash-bin: ", error);
    return NextResponse.json(
      { error: "Failed to empty trash" },
      { status: 500 }
    );
  }
}
