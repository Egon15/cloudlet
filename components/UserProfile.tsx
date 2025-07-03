// UserProfile component displays the signed-in user's profile with avatar, name, email, and account status.
// Includes loading and signed-out fallback UI, sign-out functionality, and visual badges for role and verification.

"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut, Mail, Shield, User, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserProfile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = () => {
    signOut(() => {
      router.push("/");
    });
  };

  if (!isLoaded) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              Loading Profile...
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4 py-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              User Profile
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="text-center py-8">
            <Avatar className="mx-auto h-24 w-24 mb-4">
              <AvatarFallback>GU</AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold">Not Signed In</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please sign in to view your profile.
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push("/sign-in")}
              variant="default"
            >
              Sign In
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const initials = fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();
  const email = user.primaryEmailAddress?.emailAddress || "";
  const userRole = user.publicMetadata.role as string | undefined;
  const emailVerified =
    user.emailAddresses?.[0]?.verification?.status === "verified";

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            User Profile
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="py-6">
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.imageUrl} alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{fullName}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>
            {userRole && (
              <Badge variant="secondary" className="mt-2">
                {userRole}
              </Badge>
            )}
          </div>

          <Separator className="my-4" />

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Account Status</span>
              </div>
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                Active
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email Verification</span>
              </div>
              <Badge
                variant="outline"
                className={
                  emailVerified
                    ? "text-green-600 border-green-600"
                    : "text-yellow-600 border-yellow-600"
                }
              >
                {emailVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="justify-end">
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
