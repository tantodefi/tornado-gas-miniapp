//file:tornado-gas-miniapp/apps/web/components/layout/app-header.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";
import { LogOut } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useFarcaster } from "../../context/farcaster/FarcasterProvider";

/**
 * Tornado Gas Mini App Header Component
 * Left: App Name
 * Right: My Cards + Farcaster User + Disconnect
 */
export const AppHeader: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    user: fcUser,
    isAuthenticated: fcAuthenticated,
    logout: fcLogout,
  } = useFarcaster();

  const handleDisconnect = () => {
    disconnect();
    fcLogout();
  };

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 bg-prepaid-gradient bg-opacity-90 backdrop-blur-md border-b border-slate-600/30">
      {/* Left side - App Name */}
      <Link
        href="/"
        className="font-semibold text-slate-200 font-mono text-sm sm:text-base hover:text-purple-400 transition-colors"
      >
        🌪️ Tornado Gas
      </Link>

      {/* Right side - Navigation and Wallet */}
      <div className="flex items-center space-x-4">
        {/* Docs Link */}
        <Link
          href="https://docs.prepaidgas.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-mono flex items-center gap-2"
        >
          📚 Docs
        </Link>

        {/* My Cards Link */}
        <Link
          href="/cards/my-cards"
          className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-mono flex items-center gap-2"
        >
          💳 My Cards
        </Link>

        {/* Farcaster User Info */}
        {fcAuthenticated && fcUser && (
          <div className="flex items-center space-x-2">
            {fcUser.pfpUrl && (
              <img
                src={fcUser.pfpUrl}
                alt={
                  fcUser.displayName || fcUser.username || `FID ${fcUser.fid}`
                }
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-xs text-slate-400 font-mono">
              {fcUser.displayName || fcUser.username || `FID ${fcUser.fid}`}
            </span>
          </div>
        )}

        {/* Wallet Info - only show when connected */}
        {isConnected && address && (
          <div className="text-xs text-slate-500 font-mono">
            {formatAddress(address)}
          </div>
        )}

        {/* Disconnect Button - show if either wallet or Farcaster is connected */}
        {(isConnected || fcAuthenticated) && (
          <Button
            onClick={handleDisconnect}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 font-mono"
            title="Disconnect"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </Button>
        )}
      </div>
    </header>
  );
};
