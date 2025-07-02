"use client";

import { Folder, FileText } from "lucide-react";
import { IKImage } from "imagekitio-next";
import type { FileType } from "@/lib/db/schema"; // Ensure this path is correct

interface FileIconProps {
  file: FileType;
}

export default function FileIcon({ file }: FileIconProps) {
  if (file.isFolder) {
    // For folders, we use a consistent blue color.
    // Shadcn often uses 'text-primary' for primary actions/elements,
    // but a specific blue like 'text-blue-500' is fine if you prefer it.
    return <Folder className="h-5 w-5 text-blue-500" />;
  }

  const fileType = file.type.split("/")[0]; // e.g., "image", "application", "video"

  switch (fileType) {
    case "image":
      return (
        // The div provides a container for the image, styled similarly to a small thumbnail.
        // Shadcn UI doesn't have a direct "Image Thumbnail" component, so this custom div is appropriate.
        <div className="h-12 w-12 relative overflow-hidden rounded">
          <IKImage
            publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!}
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
            path={file.path}
            // ImageKit transformations for a small thumbnail
            transformation={[
              {
                height: 48,
                width: 48,
                focus: "auto",
                quality: 80,
                dpr: 2, // Use device pixel ratio for sharper images on high-DPI screens
              },
            ]}
            loading="lazy" // Lazy load the image for performance
            lqip={{ active: true }} // Low-Quality Image Placeholder
            alt={file.name} // Alt text for accessibility
            // Inline style for object-fit to ensure the image covers the container
            style={{ objectFit: "cover", height: "100%", width: "100%" }}
          />
        </div>
      );
    case "application":
      if (file.type.includes("pdf")) {
        // PDF files get a distinct red icon.
        return <FileText className="h-5 w-5 text-red-500" />;
      }
      // Other application types (e.g., docs, spreadsheets) get an orange icon.
      return <FileText className="h-5 w-5 text-orange-500" />;
    case "video":
      // Video files get a purple icon.
      return <FileText className="h-5 w-5 text-purple-500" />;
    default:
      // Default icon for unhandled file types.
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
}
