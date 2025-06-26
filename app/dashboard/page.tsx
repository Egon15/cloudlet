import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/DashboardContent";
import { CloudUpload } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
// import Navbar from "@/components/Navbar";

export default async function Dashboard() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  const serializedUser = user
    ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        username: user.username,
        emailAddress: user.emailAddresses?.[0]?.emailAddress,
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar user={serializedUser} />

      <main className="flex-1 container mx-auto py-8 px-6">
        <DashboardContent
          userId={userId}
          userName={
            user?.firstName ||
            user?.fullName ||
            user?.emailAddresses?.[0]?.emailAddress ||
            ""
          }
        />
      </main>

      <Separator />

      <footer className="bg-background border-t py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <CloudUpload className="h-5 w-5 text-primary" />
              {/* <TypographyH2 className="text-lg font-bold">Droply</TypographyH2> */}
            </div>
            {/* <TypographyP className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Droply
            </TypographyP> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
