"use client";

import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileUp, FileText, User } from "lucide-react";
import FileUploadForm from "@/components/FileUploadForm";
import FileList from "@/components/FileList";
import UserProfile from "@/components/UserProfile";
import { useSearchParams } from "next/navigation";

interface DashboardContentProps {
  userId: string;
  userName: string;
}

export default function DashboardContent({
  userId,
  userName,
}: DashboardContentProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<string>("files");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam === "profile") {
      setActiveTab("profile");
    } else {
      setActiveTab("files");
    }
  }, [tabParam]);

  const handleFileUploadSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleFolderChange = useCallback((folderId: string | null) => {
    setCurrentFolder(folderId);
  }, []);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-foreground">
          Hi,{" "}
          <span className="text-primary">
            {userName?.length > 10
              ? `${userName?.substring(0, 10)}...`
              : userName?.split(" ")[0] || "there"}
          </span>
          !
        </h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Your images are waiting for you.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 gap-2">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>My Files</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-row items-center gap-2">
                <FileUp className="h-5 w-5 text-primary" />
                <CardTitle>Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploadForm
                  userId={userId}
                  onUploadSuccess={handleFileUploadSuccess}
                  currentFolder={currentFolder}
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Your Files</CardTitle>
              </CardHeader>
              <CardContent>
                <FileList
                  userId={userId}
                  refreshTrigger={refreshTrigger}
                  onFolderChange={handleFolderChange}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <div className="mt-4">
            <UserProfile />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
