"use client";

import { useEffect, useState, useMemo } from "react";
import { Trash2, XCircle } from "lucide-react";
import { Table, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import type { FileType } from "@/lib/db/schema";
import axios from "axios";
// import ConfirmationModal from "@/components/ui/ConfirmationModal";
import FileEmptyState from "@/components/FileEmptyState";
import FileIcon from "@/components/FileIcon";
import FileActions from "@/components/FileActions";
import FileLoadingState from "@/components/FileLoadingState";
import FileTabs from "@/components/FileTabs";
import FolderNavigation from "@/components/FolderNavigation";
import FileActionButtons from "@/components/FileActionButtons";
import { log } from "console";

export default function FileList({
  userId,
  refreshTrigger = 0,
  onFolderChange,
}: any) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>(
    []
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let url = `/api/files?userId=${userId}`;
      if (currentFolder) url += `&parentId=${currentFolder}`;
      const res = await axios.get(url);
      setFiles(res.data);
    } catch {
      toast("Error loading files", {
        description: "We couldn't load your files.",
        icon: <XCircle className="text-red-500" />,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [userId, refreshTrigger, currentFolder]);

  const filteredFiles = useMemo(() => {
    return files.filter((f) =>
      activeTab === "starred"
        ? f.isStarred && !f.isTrash
        : activeTab === "trash"
        ? f.isTrash
        : !f.isTrash
    );
  }, [files, activeTab]);

  const trashCount = useMemo(
    () => files.filter((f) => f.isTrash).length,
    [files]
  );
  const starredCount = useMemo(
    () => files.filter((f) => f.isStarred && !f.isTrash).length,
    [files]
  );

  //   // Handler examples: starring, trashing, deleting & emptying, downloads...
  const handleStarFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/star`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to update star status.");
      }

      // Update local state
      let updatedFile: FileType | undefined;
      setFiles((prevFiles) =>
        prevFiles.map((file) => {
          if (file.id === fileId) {
            updatedFile = { ...file, isStarred: !file.isStarred };
            return updatedFile;
          }
          return file;
        })
      );

      // Show Sonner toast
      if (updatedFile) {
        toast.success(
          updatedFile.isStarred ? "Added to Starred" : "Removed from Starred",
          {
            description: `"${updatedFile.name}" has been ${
              updatedFile.isStarred ? "added to" : "removed from"
            } your starred files.`,
          }
        );
      }
    } catch (error) {
      console.error("Error starring file:", error);
      toast.error("Action Failed", {
        description: "We couldn't update the star status. Please try again.",
      });
    }
  };

  const handleTrashFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/trash`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to update file status.");
      }

      const responseData = await response.json(); // Assuming API returns { isTrash: boolean }

      // Update local state
      let updatedFile: FileType | undefined;
      setFiles((prevFiles) =>
        prevFiles.map((file) => {
          if (file.id === fileId) {
            updatedFile = { ...file, isTrash: responseData.isTrash };
            return updatedFile;
          }
          return file;
        })
      );

      // Show Sonner toast
      if (updatedFile) {
        toast.success(
          updatedFile.isTrash ? "Moved to Trash" : "Restored from Trash",
          {
            description: `"${updatedFile.name}" has been ${
              updatedFile.isTrash ? "moved to trash" : "restored"
            }.`,
          }
        );
      }
    } catch (error) {
      console.error("Error trashing file:", error);
      toast.error("Action Failed", {
        description: "We couldn't update the file status. Please try again.",
      });
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      // Store file info before deletion for the toast message
      const fileToDelete = files.find((f) => f.id === fileId);
      const fileName = fileToDelete?.name || "File";

      // Send delete request
      const response = await fetch(`/api/files/${fileId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete file.");
      }

      // Remove file from local state
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));

      // Show success Sonner toast
      toast.success("File Permanently Deleted", {
        description: `"${fileName}" has been permanently removed.`,
      });

      // Close modal if it was open
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Deletion Failed", {
        description: "We couldn't delete the file. Please try again later.",
      });
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const response = await fetch(`/api/files/empty-trash`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to empty trash.");
      }

      // Remove all trashed files from local state
      setFiles((prevFiles) => prevFiles.filter((file) => !file.isTrash));

      // Show Sonner toast
      toast.success("Trash Emptied", {
        description: `All ${trashCount} items have been permanently deleted.`,
      });

      // Close modal
      setEmptyTrashModalOpen(false);
    } catch (error) {
      console.error("Error emptying trash:", error);
      toast.error("Action Failed", {
        description: "We couldn't empty the trash. Please try again later.",
      });
    }
  };

  // Add this function to handle file downloads
  const handleDownloadFile = async (file: FileType) => {
    const loadingToastId = toast.loading("Preparing Download", {
      description: `Getting "${file.name}" ready for download...`,
    });

    try {
      let downloadUrl: string;

      // For images, use the ImageKit URL directly with optimized settings
      if (file.type.startsWith("image/")) {
        // Create a download-optimized URL with ImageKit
        // Using high quality and original dimensions for downloads
        // Ensure NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT is correctly defined in your .env
        downloadUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-100,orig-true/${file.path}`;
      } else {
        // For other file types, use the fileUrl directly
        downloadUrl = file.fileUrl;
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      // Get the blob data
      const blob = await response.blob();

      // Create a download link
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.name; // Suggests a filename for download
      document.body.appendChild(link); // Temporarily append to trigger download

      // Trigger download
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      // Update loading toast to success
      toast.success("Download Ready", {
        id: loadingToastId, // Close the specific loading toast
        description: `"${file.name}" has finished downloading.`,
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Download Failed", {
        id: loadingToastId, // Close the specific loading toast
        description: "We couldn't download the file. Please try again later.",
      });
    }
  };

  if (loading) return <FileLoadingState />;

  return (
    <div className="space-y-6">
      <FileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        files={files}
        starredCount={starredCount}
        trashCount={trashCount}
      />

      {activeTab === "all" && (
        <FolderNavigation
          folderPath={folderPath}
          navigateUp={() => {
            /* ... */
          }}
          navigateToPathFolder={(index: number) => {
            console.log("Navigating to folder at index: ", index);
          }}
        />
      )}

      <FileActionButtons
        activeTab={activeTab}
        trashCount={trashCount}
        folderPath={folderPath}
        onRefresh={fetchFiles}
        onEmptyTrash={() => setEmptyTrashModalOpen(true)}
      />

      <Separator />

      {filteredFiles.length === 0 ? (
        <FileEmptyState activeTab={activeTab} />
      ) : (
        <Card className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell className="hidden sm:table-cell">Type</TableCell>
                <TableCell className="hidden md:table-cell">Size</TableCell>
                <TableCell className="hidden sm:table-cell">Added</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredFiles.map((file) => (
                <TableRow
                  key={file.id}
                  onClick={() => {
                    if (file.isFolder) onFolderChange?.(file.id);
                    else if (file.type.startsWith("image/"))
                      window.open(/* ... */);
                  }}
                  className={`transition-colors ${
                    file.isFolder || file.type.startsWith("image/")
                      ? "cursor-pointer hover:bg-muted"
                      : ""
                  }`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <FileIcon file={file} />
                      <div>
                        <p className="font-medium truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <div className="text-xs text-muted-foreground sm:hidden">
                          {formatDistanceToNow(new Date(file.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {file.isFolder ? "Folder" : file.type}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {file.isFolder
                      ? "-"
                      : file.size < 1024
                      ? `${file.size} B`
                      : file.size < 1048576
                      ? `${(file.size / 1024).toFixed(1)} KB`
                      : `${(file.size / 1048576).toFixed(1)} MB`}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(file.createdAt), {
                        addSuffix: true,
                      })}
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(file.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <FileActions
                      file={file}
                      onStar={handleStarFile}
                      onTrash={handleTrashFile}
                      onDelete={(f) => {
                        setSelectedFile(f);
                        setDeleteModalOpen(true);
                      }}
                      onDownload={handleDownloadFile}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirm Permanent Deletion"
        description="Are you sure you want to permanently delete this file?"
        icon={XCircle}
        confirmText="Delete Permanently"
        confirmColor="destructive"
        onConfirm={() => selectedFile && handleDeleteFile(selectedFile.id)}
        warningMessage={`Permanently delete "${selectedFile?.name}"? Cannot be undone.`}
      />

      <ConfirmationModal
        isOpen={emptyTrashModalOpen}
        onOpenChange={setEmptyTrashModalOpen}
        title="Empty Trash"
        description="Are you sure?"
        icon={Trash2}
        confirmText="Empty Trash"
        confirmColor="destructive"
        onConfirm={handleEmptyTrash}
        warningMessage={`All ${trashCount} items will be permanently deleted.`}
      />
    </div>
  );
}
