//file:tornado-gas-miniapp/apps/web/context/farcaster/FarcasterProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { MiniAppLoading } from "../../components/shared/miniapp-loading";

interface FarcasterUser {
  fid: number;
  displayName?: string;
  username?: string;
  pfpUrl?: string;
}

interface FarcasterContextType {
  user: FarcasterUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  getToken: () => Promise<string>;
  logout: () => void;
}

const FarcasterContext = createContext<FarcasterContextType | undefined>(
  undefined,
);

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = async () => {
    try {
      const { token } = await sdk.quickAuth.getToken();
      return token;
    } catch (err) {
      console.error("Failed to get Farcaster token:", err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  const fetchUserProfile = async (fid: number) => {
    try {
      // Fetch user profile from Neynar or other Farcaster API
      const response = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
        {
          headers: {
            api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY || "",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const userData = data.users?.[0];
        if (userData) {
          return {
            fid,
            displayName: userData.display_name,
            username: userData.username,
            pfpUrl: userData.pfp_url,
          };
        }
      }
    } catch (err) {
      console.warn("Failed to fetch user profile:", err);
    }

    // Fallback to basic user data
    return { fid };
  };

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get token and extract FID
        const token = await getToken();

        // Decode JWT to get FID (simple base64 decode)
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3 || !tokenParts[1]) {
          throw new Error("Invalid JWT format");
        }
        const payload = JSON.parse(atob(tokenParts[1]));
        const fid = payload.sub;

        if (fid) {
          const userProfile = await fetchUserProfile(fid);
          setUser(userProfile);
        }

        // Signal that the app is ready
        await sdk.actions.ready();
      } catch (err) {
        console.error("Failed to initialize Farcaster:", err);
        setError("Failed to authenticate with Farcaster");
      } finally {
        setIsLoading(false);
      }
    };

    initializeFarcaster();
  }, []);

  const value: FarcasterContextType = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    getToken,
    logout,
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <FarcasterContext.Provider value={value}>
        <MiniAppLoading message="Connecting to Farcaster..." />
      </FarcasterContext.Provider>
    );
  }

  // Show error state if authentication failed
  if (error) {
    return (
      <FarcasterContext.Provider value={value}>
        <MiniAppLoading message={`Error: ${error}`} />
      </FarcasterContext.Provider>
    );
  }

  return (
    <FarcasterContext.Provider value={value}>
      {children}
    </FarcasterContext.Provider>
  );
}

export function useFarcaster() {
  const context = useContext(FarcasterContext);
  if (context === undefined) {
    throw new Error("useFarcaster must be used within a FarcasterProvider");
  }
  return context;
}
