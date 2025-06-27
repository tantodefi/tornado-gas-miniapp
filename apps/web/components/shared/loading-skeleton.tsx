"use client";

import React from "react";
import { LabelHeader } from "../layout/page-header";

/**
 * Props for LoadingSkeleton component
 */
interface LoadingSkeletonProps {
  /** Handler for back button click */
  onBack: () => void;
}

/**
 * LoadingSkeleton Component
 *
 * Single Responsibility: Display loading state for pool details page
 *
 * Features:
 * - Consistent header with back navigation
 * - Skeleton layout matching the actual content structure
 * - Animated pulse effects
 * - Responsive grid layout
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ onBack }) => (
  <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <LabelHeader
        backText="← Back to Pools"
        onBack={onBack}
        label="Loading..."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-5">
          <div className="w-full h-[400px] bg-slate-800/50 rounded-2xl animate-pulse mb-6"></div>
          <div className="w-full h-[200px] bg-slate-800/50 rounded-2xl animate-pulse"></div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-7">
          <div className="w-full h-[300px] bg-slate-800/50 rounded-2xl animate-pulse mb-8"></div>
          <div className="w-full h-[400px] bg-slate-800/50 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

export default LoadingSkeleton;
