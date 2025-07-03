import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

// Load Inter font with CSS variable for global use
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Metadata for the entire application
export const metadata: Metadata = {
  title: "Cloudlet",
  description: "Cloud based storage solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ClerkProvider handles auth context across the app
    <ClerkProvider>
      <html lang="en">
        {/* Global font, styling, and layout */}
        <body className={`${inter.variable} antialiased overflow-x-hidden`}>
          {children}
          {/* Toast notifications */}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
