// FileIcon component dynamically renders an icon or thumbnail based on the file type.
// It displays folders, images (with ImageKit preview), PDFs, and other file formats with appropriate icons.

"use client";

import { Folder, FileText } from "lucide-react";
import { IKImage } from "imagekitio-next";
import type { FileType } from "@/lib/db/schema";

interface FileIconProps {
  file: FileType;
}

export default function FileIcon({ file }: FileIconProps) {
  if (file.isFolder) {
    return <Folder className="h-5 w-5 text-blue-500" />;
  }

  const fileType = file.type.split("/")[0];

  switch (fileType) {
    case "image":
      return (
        <div className="h-12 w-12 relative overflow-hidden rounded">
          <IKImage
            publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!}
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
            path={file.path}
            transformation={[
              {
                height: 48,
                width: 48,
                focus: "auto",
                quality: 80,
                dpr: 2,
              },
            ]}
            loading="lazy"
            lqip={{ active: true }}
            alt={file.name}
            style={{ objectFit: "cover", height: "100%", width: "100%" }}
          />
        </div>
      );
    case "application":
      if (file.type.includes("pdf")) {
        return <FileText className="h-5 w-5 text-red-500" />;
      }
      return <FileText className="h-5 w-5 text-orange-500" />;
    case "video":
      return <FileText className="h-5 w-5 text-purple-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
}
