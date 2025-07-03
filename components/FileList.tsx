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
import { ConfirmationModal } from "@/components/ConfirmationModal";
import FileEmptyState from "@/components/FileEmptyState";
import FileIcon from "@/components/FileIcon";
import FileActions from "@/components/FileActions";
import FileLoadingState from "@/components/FileLoadingState";
import FileTabs from "@/components/FileTabs";
import FolderNavigation from "@/components/FolderNavigation";
import FileActionButtons from "@/components/FileActionButtons";

interface FileListProps {
  userId: string;
  refreshTrigger?: number;
  onFolderChange: (folderId: string | null) => void;
}

export default function FileList({
  userId,
  refreshTrigger = 0,
  onFolderChange,
}: FileListProps) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "starred" | "trash">(
    "all"
  );
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>(
    []
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  // FETCH FILES
  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = { userId };
        if (currentFolder) params.parentId = currentFolder;
        const res = await axios.get("/api/files", { params });
        setFiles(res.data);
      } catch {
        toast.error("Error loading files", {
          description: "Could not load your files.",
          icon: <XCircle />,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [userId, currentFolder, refreshTrigger]);

  const handleStarFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/star`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to update star status.");
      }

      // Update UI
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId ? { ...file, isStarred: !file.isStarred } : file
        )
      );

      const file = files.find((f) => f.id === fileId);
      const isNowStarred = !file?.isStarred;

      toast.success(
        isNowStarred ? "Added to Starred" : "Removed from Starred",
        {
          description: `"${file?.name}" has been ${
            isNowStarred ? "added to" : "removed from"
          } your starred files.`,
        }
      );
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

      if (!response.ok) throw new Error("Failed to update file status.");

      const responseData = await response.json();

      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId ? { ...file, isTrash: responseData.isTrash } : file
        )
      );

      toast.success(
        responseData.isTrash ? "Moved to Trash" : "Restored from Trash",
        {
          description: `"${
            files.find((f) => f.id === fileId)?.name
          }" has been ${responseData.isTrash ? "moved to trash" : "restored"}.`,
        }
      );
    } catch (error) {
      console.error("Error trashing file:", error);
      toast.error("Action Failed", {
        description: "We couldn't update the file status. Please try again.",
      });
    }
  };
  const handleDownloadFile = async (file: FileType) => {
    const loadingToastId = toast.loading("Preparing Download", {
      description: `Getting "${file.name}" ready for download...`,
    });

    try {
      let downloadUrl: string;

      if (file.type.startsWith("image/")) {
        downloadUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-100,orig-true/${file.path}`;
      } else {
        downloadUrl = file.fileUrl;
      }

      const response = await fetch(downloadUrl);
      if (!response.ok)
        throw new Error(`Download failed: ${response.statusText}`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast.success("Download Ready", {
        id: loadingToastId,
        description: `"${file.name}" has finished downloading.`,
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Download Failed", {
        id: loadingToastId,
        description: "We couldn't download the file. Please try again later.",
      });
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const fileToDelete = files.find((f) => f.id === fileId);
      const fileName = fileToDelete?.name || "File";

      const response = await fetch(`/api/files/${fileId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete file.");
      }

      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));

      toast.success("File Permanently Deleted", {
        description: `"${fileName}" has been permanently removed.`,
      });

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

      if (!response.ok) throw new Error("Failed to empty trash.");

      setFiles((prevFiles) => prevFiles.filter((file) => !file.isTrash));

      toast.success("Trash Emptied", {
        description: `All ${trashCount} items have been permanently deleted.`,
      });

      setEmptyTrashModalOpen(false);
    } catch (error) {
      console.error("Error emptying trash:", error);
      toast.error("Action Failed", {
        description: "We couldn't empty the trash. Please try again later.",
      });
    }
  };

  // FILTERS
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

  // NAVIGATION HANDLERS
  const handleNavigateUp = () => {
    setFolderPath((prev) => {
      const newPath = prev.slice(0, -1);
      const newCurrent = newPath.at(-1)?.id ?? null;
      setCurrentFolder(newCurrent);
      onFolderChange(newCurrent);
      return newPath;
    });
  };

  const handleNavigateToPathFolder = (index: number) => {
    if (index === -1) {
      setFolderPath([]);
      setCurrentFolder(null);
      onFolderChange(null);
    } else {
      const newPath = folderPath.slice(0, index + 1);
      const newCurrent = newPath.at(-1)?.id ?? null;
      setFolderPath(newPath);
      setCurrentFolder(newCurrent);
      onFolderChange(newCurrent);
    }
  };

  const handleFolderClick = (file: FileType) => {
    if (!file.isFolder) return;
    setFolderPath((prev) => [...prev, { id: file.id, name: file.name }]);
    setCurrentFolder(file.id);
    onFolderChange(file.id);
  };

  if (loading) return <FileLoadingState />;

  return (
    <div className="space-y-6">
      <FileTabs
        activeTab={activeTab}
        onTabChange={(key) => {
          if (key === "all" || key === "starred" || key === "trash") {
            setActiveTab(key);
          }
        }}
        files={files}
        starredCount={starredCount}
        trashCount={trashCount}
      />

      {activeTab === "all" && (
        <FolderNavigation
          folderPath={folderPath}
          navigateUp={handleNavigateUp}
          navigateToPathFolder={handleNavigateToPathFolder}
        />
      )}

      <FileActionButtons
        activeTab={activeTab}
        trashCount={trashCount}
        folderPath={folderPath}
        onRefresh={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 100);
        }}
        onEmptyTrash={() => setEmptyTrashModalOpen(true)}
      />

      <Separator />

      {filteredFiles.length === 0 ? (
        <FileEmptyState activeTab={activeTab} />
      ) : (
        <Card className="overflow-x-auto">
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
                  onClick={() =>
                    file.isFolder
                      ? handleFolderClick(file)
                      : file.type.startsWith("image/")
                      ? window.open(file.fileUrl, "_blank")
                      : undefined
                  }
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
                        <span className="text-xs text-muted-foreground sm:hidden">
                          {formatDistanceToNow(new Date(file.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
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
                      : file.size < 1_048_576
                      ? `${(file.size / 1024).toFixed(1)} KB`
                      : `${(file.size / 1_048_576).toFixed(1)} MB`}
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
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
        warningMessage={`Permanently delete "${selectedFile?.name}"? This cannot be undone.`}
        cancelText="Keep File"
      />

      <ConfirmationModal
        isOpen={emptyTrashModalOpen}
        onOpenChange={setEmptyTrashModalOpen}
        title="Empty Trash"
        description="Are you sure you want to permanently delete all items in your trash?"
        icon={Trash2}
        confirmText="Empty Trash Permanently"
        confirmColor="destructive"
        onConfirm={handleEmptyTrash}
        warningMessage={`All ${trashCount} items will be permanently deleted. This cannot be undone.`}
        cancelText="Keep Items"
      />
    </div>
  );
}
