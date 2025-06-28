//file:prepaid-gas-website/apps/web/components/features/pools/info-row.tsx
"use client";

import React, { useState } from "react";

/**
 * Props for InfoRow component
 */
interface InfoRowProps {
  /** Label text to display on the left */
  label: string;
  /** Value text to display on the right */
  value: string;
  /** Optional CSS classes for the value styling */
  valueClass?: string;
  /** Optional full text to copy when copy button is clicked */
  copyable?: string;
}

/**
 * InfoRow Component
 *
 * Single Responsibility: Display a label-value pair with optional copy functionality
 *
 * Features:
 * - Clean label/value layout
 * - Optional copy-to-clipboard functionality
 * - Hover effects and visual feedback
 * - Accessible copy button with tooltip
 */
const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  valueClass = "text-white",
  copyable,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyable) return;

    try {
      await navigator.clipboard.writeText(copyable);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="flex justify-between items-center group">
      <span className="text-slate-400 text-sm">{label}:</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${valueClass}`}>{value}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-purple-400 transition-all duration-200 text-xs"
            title="Click to copy full value"
          >
            {copied ? "✓" : "📋"}
          </button>
        )}
      </div>
    </div>
  );
};

export default InfoRow;
