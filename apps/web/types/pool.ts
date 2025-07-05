//file:prepaid-gas-website/apps/web/types/pool.ts
/**
 * Pool-related type definitions
 * Simplified to directly use @workspace/data package types
 */

import type { SerializedPool, SerializedPoolMember } from "@workspace/data";

/**
 * ========================================
 * CORE TYPES - Direct from Data Package
 * ========================================
 */

export type Pool = SerializedPool;

/**
 * Pool member type for web app - directly uses serialized data package type
 */
export type PoolMember = SerializedPoolMember;

/**
 * ========================================
 * UI/DISPLAY HELPER TYPES
 * ========================================
 */

/**
 * Filter state for pool filtering and sorting
 */
export interface FilterState {
  network: string;
  amountRange: string;
  memberRange: string;
  sortBy: string;
}

/**
 * Pool overview data for display components
 * Updated to use new field names from data package
 */
export interface PoolOverviewData {
  joiningFee: string;
  totalDeposits: string;
  memberCount: string; // Updated from membersCount
  createdAtTimestamp: string; // Updated from createdAt
  network: string; // Simplified to just network name
}
