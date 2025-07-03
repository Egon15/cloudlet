// Navbar component manages top navigation with dynamic links based on auth state.
// Includes desktop and mobile menu, user avatar, sign in/out, and responsive behavior.

"use client";

import { useClerk, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  CloudUpload,
  ChevronDown,
  Menu as MenuIcon,
  X as XIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useRef } from "react";

interface SerializedUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  username?: string | null;
  emailAddress?: string | null;
}

interface NavbarProps {
  user?: SerializedUser | null;
}

export default function Navbar({ user }: NavbarProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isOnDashboard =
    pathname === "/dashboard" || pathname?.startsWith("/dashboard/");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = () => signOut(() => router.push("/"));

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "";
  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";
  const email = user?.emailAddress || "";

  return (
    <header
      className={`bg-background border-b sticky top-0 z-50 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 z-10">
          <CloudUpload className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Cloudlet</h1>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </SignedOut>

          <SignedIn>
            {!isOnDashboard && (
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    {user?.imageUrl ? (
                      <AvatarImage src={user.imageUrl} alt={fullName} />
                    ) : (
                      <AvatarFallback>{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="hidden sm:inline">{fullName || "User"}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard?tab=profile")}
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  My Files
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleSignOut}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <SignedIn>
            <Avatar className="h-8 w-8">
              {user?.imageUrl ? (
                <AvatarImage src={user.imageUrl} alt={fullName} />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
          </SignedIn>
          <button onClick={toggleMobileMenu} className="p-2">
            {isMobileMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        <div
          ref={mobileMenuRef}
          className={`fixed right-0 top-0 bottom-0 bg-background w-4/5 max-w-sm z-50 p-6 transform ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform`}
        >
          <SignedOut>
            <div className="flex flex-col gap-4">
              <Link href="/sign-in" onClick={toggleMobileMenu}>
                <Button variant="ghost" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" onClick={toggleMobileMenu}>
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar className="h-10 w-10">
                  {user?.imageUrl ? (
                    <AvatarImage src={user.imageUrl} alt={fullName} />
                  ) : (
                    <AvatarFallback>{initials}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{fullName || "User"}</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="py-2 px-3 rounded-md hover:bg-slate-100"
                onClick={toggleMobileMenu}
              >
                My Files
              </Link>
              <Link
                href="/dashboard?tab=profile"
                className="py-2 px-3 rounded-md hover:bg-slate-100"
                onClick={toggleMobileMenu}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  toggleMobileMenu();
                  handleSignOut();
                }}
                className="py-2 px-3 text-destructive hover:bg-red-50 rounded-md"
              >
                Sign Out
              </button>
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
