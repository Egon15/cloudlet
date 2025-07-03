"use client";

import type { ThemeProviderProps } from "next-themes";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ImageKitProvider } from "imagekitio-next";
import { createContext, useContext } from "react";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

// Create context to expose ImageKit auth functionality
export const ImageKitAuthContext = createContext<{
  authenticate: () => Promise<{
    signature: string;
    token: string;
    expire: number;
  }>;
}>({
  authenticate: async () => ({ signature: "", token: "", expire: 0 }),
});

// Hook to use ImageKit authentication context
export const useImageKitAuth = () => useContext(ImageKitAuthContext);

// Authenticator function to fetch signed parameters from backend
const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit-auth");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

// Global providers: Theme + ImageKit
export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <ImageKitProvider
      authenticator={authenticator}
      publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
    >
      {/* Provide custom ImageKit auth context to child components */}
      <ImageKitAuthContext.Provider value={{ authenticate: authenticator }}>
        {/* Provide theme (light/dark) support */}
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </ImageKitAuthContext.Provider>
    </ImageKitProvider>
  );
}
