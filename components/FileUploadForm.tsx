"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  X,
  FileUp,
  AlertTriangle,
  FolderPlus,
  ArrowRight,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface FileUploadFormProps {
  userId: string;
  onUploadSuccess?: () => void;
  currentFolder?: string | null;
}

export default function FileUploadForm({
  userId,
  onUploadSuccess,
  currentFolder = null,
}: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (droppedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      return;
    }

    setFile(droppedFile);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    if (currentFolder) {
      formData.append("parentId", currentFolder);
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      await axios.post("/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setProgress(percent);
          }
        },
      });

      toast("Folder created", {
        description: `"${folderName}" was uploaded successfully.`,
        icon: <FolderPlus className="text-green-500" />,
      });

      clearFile();
      onUploadSuccess?.();
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
      toast("Upload failed", {
        description: "We couldn't upload your file.",
        icon: <XCircle className="text-red-500" />,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast("Invalid folder name", {
        description: "Please enter a valid folder name.",
        icon: <XCircle className="text-red-500" />,
      });

      return;
    }

    setCreatingFolder(true);

    try {
      await axios.post("/api/folders/create", {
        name: folderName.trim(),
        userId,
        parentId: currentFolder,
      });

      toast("Folder created", {
        description: `"${folderName}" was created successfully.`,
        icon: <FolderPlus className="text-green-500" />,
      });

      setFolderName("");
      setFolderDialogOpen(false);
      onUploadSuccess?.();
    } catch (error) {
      console.error("Folder creation error:", error);
      toast("Folder creation failed", {
        description: "We couldn't create the folder. Please try again.",
        icon: <XCircle className="text-red-500" />,
      });
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setFolderDialogOpen(true)}
          className="flex-1"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          <FileUp className="mr-2 h-4 w-4" />
          Add Image
        </Button>
      </div>

      {/* File Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
          error
            ? "border-red-500 bg-red-50"
            : file
            ? "border-primary/40 bg-primary/10"
            : "border-muted hover:border-primary"
        }`}
      >
        {!file ? (
          <div className="space-y-3">
            <FileUp className="h-10 w-10 mx-auto text-primary" />
            <p className="text-muted-foreground">
              Drag and drop your image here or{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-muted-foreground">Max size: 5MB</p>
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium truncate max-w-[180px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-100 text-red-800 p-2 rounded-md">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {uploading && <Progress value={progress} className="h-2" />}

            <Button
              onClick={handleUpload}
              disabled={!!error || uploading}
              className="w-full"
            >
              {uploading ? `Uploading... ${progress}%` : "Upload Image"}
              {!uploading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-muted/10 p-4 rounded-md text-sm">
        <p className="font-medium mb-1">Tips:</p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs">
          <li>Images are private and only visible to you</li>
          <li>Supported formats: JPG, PNG, GIF, WebP</li>
          <li>Maximum file size: 5MB</li>
        </ul>
      </div>

      {/* Folder Dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-primary" />
              New Folder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateFolder} disabled={!folderName.trim()}>
              Create
              {!creatingFolder && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
