"use client";

import React from "react";
import { useRouter } from "next/navigation";

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
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  backText = "← Back",
  onBack,
  rightContent,
  className = "",
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={`flex justify-between items-center mb-8 ${className}`}>
      <button
        onClick={handleBack}
        className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-mono"
      >
        {backText}
      </button>
      {rightContent && (
        <div className="text-xs text-slate-500 font-mono">{rightContent}</div>
      )}
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
export const LabelHeader: React.FC<{
  backText?: string;
  onBack?: () => void;
  label: string;
}> = ({ backText, onBack, label }) => (
  <PageHeader backText={backText} onBack={onBack} rightContent={label} />
);

/** Header for home navigation */
export const HomeHeader: React.FC<{
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

export default PageHeader;
