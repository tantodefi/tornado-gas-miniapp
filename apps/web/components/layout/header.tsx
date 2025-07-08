//file:prepaid-gas-website/apps/web/components/layout/header.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { LogOut } from "lucide-react";

/**
 * Header Component
 *
 * Matches your existing page header design pattern exactly:
 * - Same fonts, colors, and spacing
 * - Same hover effects and transitions
 * - Minimal and clean like your current headers
 * - Only shows when wallet is connected (optional)
 */
const Header: React.FC = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Format address exactly like your existing components
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Uses EXACT same styling as your existing page headers */}
      <div className="flex justify-between items-center mb-8 ">
        {/* Left side - Logo/Home link with same styling as back buttons */}
        <button
          onClick={handleLogoClick}
          className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-mono flex items-center space-x-2"
        >
          <span>Prepaid Gas</span>
        </button>

        {/* Right side - Wallet info with same styling as your rightContent */}
        <div className="flex items-center space-x-4">
          {isConnected && address && (
            <div className="text-xs text-slate-500 font-mono">
              {formatAddress(address)}
            </div>
          )}
          {isConnected && address && (
            <button
              onClick={handleDisconnect}
              className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-mono flex items-center space-x-1"
              title="Disconnect Wallet"
            >
              <LogOut className="w-3 h-3" />
              <span className="text-xs">Disconnect</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
