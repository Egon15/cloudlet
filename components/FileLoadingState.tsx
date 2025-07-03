// FileLoadingState displays a spinner and message while file data is being fetched or loaded.

"use client";

import { Loader2 } from "lucide-react";

export default function FileLoadingState() {
  return (
    <div className="flex flex-col justify-center items-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading your files...</p>
    </div>
  );
}
