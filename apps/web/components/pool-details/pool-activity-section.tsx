"use client";

import React from "react";

/**
 * PoolActivitySection Component
 *
 * Single Responsibility: Display pool activity information (currently placeholder)
 *
 * Features:
 * - Consistent card styling
 * - Placeholder for future activity tracking
 * - Clear messaging about upcoming features
 * - Maintains layout structure for future implementation
 */
const PoolActivitySection: React.FC = () => (
  <div className="card-prepaid-glass card-content-lg">
    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
      <span className="text-2xl">📊</span>
      Recent Activity
    </h2>

    <div className="text-center py-8 opacity-60">
      <div className="text-4xl mb-4">📈</div>
      <p className="text-slate-400 mb-2">Activity tracking coming soon</p>
      <p className="text-xs text-slate-500">
        Pool transactions, member joins, and gas usage statistics
      </p>
    </div>
  </div>
);

export default PoolActivitySection;
