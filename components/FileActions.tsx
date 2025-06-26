"use client";

import { Star, Trash, X, ArrowUpFromLine, Download } from "lucide-react";
import { Button } from "@/components/ui/button"; // Shadcn UI Button
import type { FileType } from "@/lib/db/schema"; // Ensure this path is correct
import { cn } from "@/lib/utils"; // For utility classes to combine styles

interface FileActionsProps {
  file: FileType;
  onStar: (id: string) => void;
  onTrash: (id: string) => void;
  onDelete: (file: FileType) => void;
  onDownload: (file: FileType) => void;
}

export default function FileActions({
  file,
  onStar,
  onTrash,
  onDelete,
  onDownload,
}: FileActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {/* Download button */}
      {!file.isTrash && !file.isFolder && (
        <Button
          variant="ghost" // Shadcn equivalent for 'flat' or transparent button
          size="sm" // Small size
          onClick={() => onDownload(file)}
          className="px-2" // Adjust padding
        >
          <Download className="h-4 w-4 mr-1 sm:mr-2" /> {/* Icon with margin */}
          <span className="hidden sm:inline">Download</span>
        </Button>
      )}

      {/* Star button */}
      {!file.isTrash && (
        <Button
          variant="ghost" // Shadcn equivalent for 'flat'
          size="sm"
          onClick={() => onStar(file.id)}
          className="px-2"
        >
          <Star
            className={cn(
              "h-4 w-4 mr-1 sm:mr-2",
              file.isStarred
                ? "text-yellow-400 fill-current" // Filled star for starred
                : "text-muted-foreground" // Muted color for unstarred
            )}
          />
          <span className="hidden sm:inline">
            {file.isStarred ? "Unstar" : "Star"}
          </span>
        </Button>
      )}

      {/* Trash/Restore button */}
      <Button
        variant="ghost" // Shadcn equivalent for 'flat'
        size="sm"
        onClick={() => onTrash(file.id)}
        className={cn(
          "px-2",
          file.isTrash
            ? "text-success-foreground hover:bg-success/90 bg-success" // Custom success styling, if you have it in your theme or define it
            : ""
        )}
      >
        {file.isTrash ? (
          <ArrowUpFromLine className="h-4 w-4 mr-1 sm:mr-2 text-green-600" /> // Restore icon
        ) : (
          <Trash className="h-4 w-4 mr-1 sm:mr-2 text-destructive" /> // Trash icon, using Shadcn destructive color
        )}
        <span className="hidden sm:inline">
          {file.isTrash ? "Restore" : "Delete"}
        </span>
      </Button>

      {/* Delete permanently button */}
      {file.isTrash && (
        <Button
          variant="ghost" // Shadcn equivalent for 'flat'
          size="sm"
          onClick={() => onDelete(file)}
          className="px-2"
        >
          <X className="h-4 w-4 mr-1 sm:mr-2 text-destructive" />{" "}
          {/* Red 'X' icon */}
          <span className="hidden sm:inline">Remove</span>
        </Button>
      )}
    </div>
  );
}
