"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Props for ErrorState component
 */
interface ErrorStateProps {
  /** Error message to display to user */
  error: string | null;
  /** Handler for back button click */
  onBack: () => void;
  /** Handler for retry button click */
  onRetry: () => void;
}

/**
 * ErrorState Component
 *
 * Single Responsibility: Display error state for pool details page
 *
 * Features:
 * - Animated error display with motion
 * - Clear error messaging
 * - Action buttons for retry and navigation
 * - Consistent styling with app theme
 */
const ErrorState: React.FC<ErrorStateProps> = ({ error, onBack, onRetry }) => (
  <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-red-400 mb-2">
          Error Loading Pool Details
        </h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">{error}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onRetry} className="btn-prepaid-primary btn-md">
            Try Again
          </button>
          <button onClick={onBack} className="btn-prepaid-outline btn-md">
            Back to Pools
          </button>
        </div>
      </motion.div>
    </div>
  </div>
);

export default ErrorState;
