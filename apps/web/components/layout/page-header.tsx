//file:prepaid-gas-website/apps/web/components/layout/page-header.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { LogOut } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

interface PageHeaderProps {
  /** Back button text (default: "← Back") */
  backText?: string;
  /** Custom back navigation function (default: router.back()) */
  onBack?: () => void;
  /** Right side content (subtitle, timestamp, etc.) */
  rightContent?: React.ReactNode;
  /** Custom className for additional styling */
  className?: string;
}

/**
 * Reusable page header component
 * Single responsibility: Provide consistent header layout with back navigation
 * Used across all app pages for consistent UX
 * UPDATED: Link to my-cards instead of pending
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  backText = "← Back",
  onBack,
  rightContent,
  className = "",
}) => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    disconnect();
  };

  // Format address exactly like your existing components
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  console.log({ isConnected });
  return (
    <div className={`flex justify-between items-center mb-8 ${className}`}>
      <button
        onClick={handleBack}
        className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-mono"
      >
        {backText}
      </button>

      <div className="flex items-center space-x-4">
        {/* UPDATED: Link to my-cards instead of pending */}
        <Link
          href="/cards/my-cards"
          className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-mono flex items-center gap-2"
        >
          💳 My Cards
        </Link>
        {/* Original rightContent comes first (main content) */}
        {rightContent && (
          <div className="text-xs text-slate-500 font-mono">{rightContent}</div>
        )}

        {/* Wallet info - only show when connected */}
        {isConnected && address && (
          <>
            <div className="text-xs text-slate-500 font-mono">
              {formatAddress(address)}
            </div>
            <Button
              onClick={handleDisconnect}
              className="text-red-400 hover:text-red-500 font-mono flex"
              title="Disconnect Wallet"
            >
              <LogOut />
              Disconnect
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Specialized header variants for common use cases
 */

/** Header with timestamp display */
export const TimestampHeader: React.FC<{
  backText?: string;
  onBack?: () => void;
  timestamp: string;
  version?: string;
}> = ({ backText, onBack, timestamp, version = "v0.1" }) => (
  <PageHeader
    backText={backText}
    onBack={onBack}
    rightContent={
      <span title={`Last updated: ${new Date(timestamp).toLocaleString()}`}>
        {version} • {new Date(timestamp).toLocaleTimeString()}
      </span>
    }
  />
);

/** Header with simple text label */
export const PoolPageHeader: React.FC<{
  backText?: string;
  onBack?: () => void;
  label: string;
}> = ({ backText, onBack, label }) => (
  <PageHeader backText={backText} onBack={onBack} rightContent={label} />
);

/** Header for home navigation */
export const PoolsPageHeader: React.FC<{
  timestamp?: string;
}> = ({ timestamp }) => (
  <PageHeader
    backText="← Back to Home"
    onBack={() => (window.location.href = "/")}
    rightContent={
      timestamp && (
        <span title={`Last updated: ${new Date(timestamp).toLocaleString()}`}>
          v0.1 • {new Date(timestamp).toLocaleTimeString()}
        </span>
      )
    }
  />
);