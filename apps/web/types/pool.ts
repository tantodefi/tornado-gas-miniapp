//file:prepaid-gas-website/apps/web/types/pool.ts
/**
 * Pool-related type definitions
 * Simplified to directly use @prepaid-gas/data package types
 */

import type { SerializedPool, SerializedPoolMember } from "@prepaid-gas/data";

export type Pool = SerializedPool;

/**
 * Pool member type for web app
 */
export type PoolMember = SerializedPoolMember;

/**
 * ========================================
 * ACTIVITY TYPES
 * ========================================
 */

/**
 * Activity item type
 */
export type ActivityType = "member_added" | "transaction";

/**
 * Base activity item interface
 */
export interface BaseActivityItem {
  /** Unique identifier for the activity */
  id: string;
  /** Type of activity */
  type: ActivityType;
  /** Timestamp of the activity (for sorting) */
  timestamp: string;
  /** Block number when activity occurred */
  blockNumber: string;
  /** Transaction hash */
  transactionHash: string;
  /** Network identifier */
  network: string;
}

/**
 * Member addition activity item
 */
export interface MemberAddedActivity extends BaseActivityItem {
  type: "member_added";
  /** Member details */
  member: {
    memberIndex: string;
    identityCommitment: string;
    merkleRootWhenAdded: string;
    rootIndexWhenAdded: number;
  };
}

/**
 * Transaction activity item
 */
export interface TransactionActivity extends BaseActivityItem {
  type: "transaction";
  /** Transaction details */
  transaction: {
    userOpHash: string;
    sender: string;
    actualGasCost: string;
    nullifier: string;
    gasPrice?: string;
  };
}

/**
 * Union type for all activity items
 */
export type ActivityItem = MemberAddedActivity | TransactionActivity;

/**
 * Enhanced pool type with activity feed
 */
export interface PoolWithActivity extends Pool {
  /** Combined activity feed (members + transactions) ordered by timestamp */
  activity?: ActivityItem[];
}

/**
 * Activity display options
 */
export interface ActivityOptions {
  /** Maximum number of activities to return */
  limit?: number;
  /** Sort order for activities */
  sortOrder?: "asc" | "desc";
  /** Filter by activity type */
  filterByType?: ActivityType[];
}
