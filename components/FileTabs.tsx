"use client";

import { File, Star, Trash } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Assuming Shadcn UI tabs path
import { cn } from "@/lib/utils"; // For utility classes like conditional styling
import type { FileType } from "@/lib/db/schema"; // Ensure this path is correct

// A simple Badge-like component for Shadcn UI, as it doesn't have one built-in
const Badge = ({
  children,
  className,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      className
    )}
    aria-label={ariaLabel}
  >
    {children}
  </span>
);

interface FileTabsProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  files: FileType[];
  starredCount: number;
  trashCount: number;
}

export default function FileTabs({
  activeTab,
  onTabChange,
  files,
  starredCount,
  trashCount,
}: FileTabsProps) {
  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={onTabChange}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 h-auto justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="all"
          className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <File className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium">All Files</span>
            <Badge
              className="bg-muted text-muted-foreground"
              aria-label={`${
                files.filter((file) => !file.isTrash).length
              } files`}
            >
              {files.filter((file) => !file.isTrash).length}
            </Badge>
          </div>
        </TabsTrigger>
        <TabsTrigger
          value="starred"
          className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Star className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium">Starred</span>
            <Badge
              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
              aria-label={`${starredCount} starred files`}
            >
              {starredCount}
            </Badge>
          </div>
        </TabsTrigger>
        <TabsTrigger
          value="trash"
          className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Trash className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium">Trash</span>
            <Badge
              className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              aria-label={`${trashCount} files in trash`}
            >
              {trashCount}
            </Badge>
          </div>
        </TabsTrigger>
      </TabsList>
      {/* You would typically have TabsContent for each tab, but the original code didn't provide content for them. */}
      {/* For example: */}
      {/* <TabsContent value="all">Content for All Files</TabsContent> */}
      {/* <TabsContent value="starred">Content for Starred Files</TabsContent> */}
      {/* <TabsContent value="trash">Content for Trash</TabsContent> */}
    </Tabs>
  );
}
