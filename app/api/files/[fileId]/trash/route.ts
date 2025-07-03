import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ fileId: string }> }
) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract fileId from route parameters
    const { fileId } = await props.params;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the file from the database
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Toggle the isTrash flag (move to trash or restore)
    const [updatedFiles] = await db
      .update(files)
      .set({ isTrash: !file.isTrash })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    // Determine action message based on new isTrash state
    const action = updatedFiles.isTrash
      ? "moved to trash-bin"
      : "restored to the previous location";

    // Return success message and updated file
    return NextResponse.json({
      ...updatedFiles,
      message: `File ${action} successfully`,
    });
  } catch (error) {
    console.error("Error updating the file's trash status", error);
    return NextResponse.json(
      { error: "Failed to update the file's trash status" },
      { status: 500 }
    );
  }
}
