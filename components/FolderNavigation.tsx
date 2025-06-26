"use client";

import { ArrowUpFromLine } from "lucide-react";
import { Button } from "@/components/ui/button"; // Shadcn UI Button
import { cn } from "@/lib/utils"; // For utility classes like conditional styling

interface FolderNavigationProps {
  folderPath: Array<{ id: string; name: string }>;
  navigateUp: () => void;
  navigateToPathFolder: (index: number) => void;
}

export default function FolderNavigation({
  folderPath,
  navigateUp,
  navigateToPathFolder,
}: FolderNavigationProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-sm overflow-x-auto pb-2">
      {" "}
      {/* Adjusted gap */}
      <Button
        variant="ghost" // Shadcn equivalent for 'flat'
        size="icon" // Shadcn size for icon-only buttons
        onClick={navigateUp}
        disabled={folderPath.length === 0} // 'isDisabled' becomes 'disabled'
      >
        <ArrowUpFromLine className="h-4 w-4" />
        <span className="sr-only">Navigate Up</span>{" "}
        {/* Added for accessibility */}
      </Button>
      <Button
        variant="ghost" // Shadcn equivalent for 'flat'
        size="sm"
        onClick={() => navigateToPathFolder(-1)}
        className={cn(
          "px-2 py-1 h-auto", // Adjust padding and height for better fit
          folderPath.length === 0
            ? "font-bold text-foreground"
            : "text-muted-foreground" // Active home link
        )}
      >
        Home
      </Button>
      {folderPath.map((folder, index) => (
        <div key={folder.id} className="flex items-center">
          <span className="mx-1 text-muted-foreground">/</span>{" "}
          {/* Adjusted text color */}
          <Button
            variant="ghost" // Shadcn equivalent for 'flat'
            size="sm"
            onClick={() => navigateToPathFolder(index)}
            className={cn(
              "px-2 py-1 h-auto text-ellipsis overflow-hidden max-w-[150px]", // Adjust padding and height
              index === folderPath.length - 1
                ? "font-bold text-foreground"
                : "text-muted-foreground" // Active folder link
            )}
            title={folder.name}
          >
            {folder.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
