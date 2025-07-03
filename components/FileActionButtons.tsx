/**
 * FileActionButtons component
 *
 * Displays action buttons and a dynamic title for the files section.
 * Adjusts based on the current tab (All, Starred, Trash), showing relevant
 * actions like refresh or empty trash.
 *
 * Props:
 * - activeTab: Current view/tab name.
 * - trashCount: Number of items in trash.
 * - folderPath: Breadcrumb trail for folder navigation.
 * - onRefresh: Callback to trigger file list refresh.
 * - onEmptyTrash: Callback to empty the trash.
 */

"use client";

import { RefreshCw, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        <Button variant="ghost" size="sm" onClick={onRefresh} className="px-3">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        {activeTab === "trash" && trashCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEmptyTrash}
            className={cn("px-3 text-destructive hover:bg-destructive/10")}
          >
            <Trash className="h-4 w-4 mr-2" />
            Empty Trash
          </Button>
        )}
      </div>
    </div>
  );
}
