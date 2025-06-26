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
  //   const handleStarFile = async (fileId: string) => {
  //     /* ... */
  //   };
  //   const handleTrashFile = async (fileId: string) => {
  //     /* ... */
  //   };
  //   const handleDeleteFile = async (fileId: string) => {
  //     /* ... */
  //   };
  //   const handleEmptyTrash = async () => {
  //     /* ... */
  //   };
  //   const handleDownloadFile = async (file: FileType) => {
  //     /* ... */
  //   };

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
          navigateToPathFolder={(i) => {
            /* ... */
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
                  <TableCell onClick={(e: Event) => e.stopPropagation()}>
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
