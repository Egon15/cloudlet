"use client";

import { RefreshCw, Trash } from "lucide-react";
import { Button } from "@/components/ui/button"; // Shadcn UI Button
import { cn } from "@/lib/utils"; // For utility classes like conditional styling

interface FileActionButtonsProps {
  activeTab: string;
  trashCount: number;
  folderPath: Array<{ id: string; name: string }>;
  onRefresh: () => void;
  onEmptyTrash: () => void;
}

export default function FileActionButtons({
  activeTab,
  trashCount,
  folderPath,
  onRefresh,
  onEmptyTrash,
}: FileActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
      <h2 className="text-xl sm:text-2xl font-semibold truncate max-w-full">
        {activeTab === "all" &&
          (folderPath.length > 0
            ? folderPath[folderPath.length - 1].name
            : "All Files")}
        {activeTab === "starred" && "Starred Files"}
        {activeTab === "trash" && "Trash"}
      </h2>
      <div className="flex gap-2 sm:gap-3 self-end sm:self-auto">
        <Button
          variant="ghost" // Shadcn equivalent for 'flat'
          size="sm"
          onClick={onRefresh}
          className="px-3" // Default Shadcn sm button padding is good, but explicitly add px if needed
        >
          <RefreshCw className="h-4 w-4 mr-2" /> {/* Icon with margin-right */}
          Refresh
        </Button>
        {activeTab === "trash" && trashCount > 0 && (
          <Button
            variant="ghost" // Using ghost variant for a 'flat' look
            size="sm"
            onClick={onEmptyTrash}
            // For 'danger' color, you can either use 'variant="destructive"' or apply custom Tailwind classes
            className={cn(
              "px-3 text-destructive hover:bg-destructive/10" // Using text-destructive for the icon/text color
            )}
          >
            <Trash className="h-4 w-4 mr-2" /> {/* Icon with margin-right */}
            Empty Trash
          </Button>
        )}
      </div>
    </div>
  );
}
