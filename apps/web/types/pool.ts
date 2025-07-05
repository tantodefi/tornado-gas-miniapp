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
