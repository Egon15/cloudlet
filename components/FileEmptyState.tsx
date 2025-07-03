"use client";

import { File } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"; // Shadcn UI Card components

interface FileEmptyStateProps {
  activeTab: string;
}

export default function FileEmptyState({ activeTab }: FileEmptyStateProps) {
  return (
    <Card className="border border-input bg-background">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <File className="h-16 w-16 mx-auto text-primary/50 mb-6" />
        <CardTitle className="text-xl font-medium mb-2">
          {activeTab === "all" && "No files available"}
          {activeTab === "starred" && "No starred files"}
          {activeTab === "trash" && "Trash is empty"}
        </CardTitle>
        <CardDescription className="mt-2 max-w-md mx-auto text-muted-foreground">
          {activeTab === "all" &&
            "Upload your first file to get started with your personal cloud storage"}
          {activeTab === "starred" &&
            "Mark important files with a star to find them quickly when you need them"}
          {activeTab === "trash" &&
            "Files you delete will appear here for 30 days before being permanently removed"}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
