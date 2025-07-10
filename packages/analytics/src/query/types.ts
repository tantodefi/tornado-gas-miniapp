/**
 * Core query builder types and interfaces
 * Updated for new subgraph schema structure
 */

import { NetworkName, PaymasterType } from "@workspace/data";
import {
  DailyGlobalStats,
  DailyPoolStats,
  NullifierUsage,
  RevenueWithdrawal,
} from "../types/subgraph";

/**
 * ========================================
 * FIELD TYPE DEFINITIONS
 * ========================================
 */

/**
 * Available fields for RevenueWithdrawal entity queries
 */
export type RevenueWithdrawalFields =
  | keyof RevenueWithdrawal
  | "paymaster { id address contractType }"; // Example of nested fields

/**
 * Available fields for NullifierUsage entity queries
 */
export type NullifierUsageFields = keyof NullifierUsage;

/**
 * Available fields for DailyPoolStats entity queries
 */
export type DailyPoolStatsFields = keyof DailyPoolStats;

/**
 * Available fields for DailyGlobalStats entity queries
 */
export type DailyGlobalStatsFields = keyof DailyGlobalStats;

/**
 * ========================================
 * WHERE CONDITION TYPES
 * ========================================
 */

/**
 * Typed where conditions for RevenueWithdrawal entity
 */

export interface RevenueWithdrawalWhereInput {
  id?: string; // network-transactionHash-logIndex composite ID if available, otherwise consider ID from subgraph
  network?: NetworkName;
  paymaster_?: {
    address?: string;
    contractType?: PaymasterType;
  };
  recipient?: string;
  amount_gte?: string; // GraphQL expects BigInt as string
  amount_lte?: string; // GraphQL expects BigInt as string
  withdrawnAtTimestamp_gte?: string; // GraphQL expects BigInt as string
  withdrawnAtTimestamp_lte?: string; // GraphQL expects BigInt as string
  withdrawnAtBlock?: string; // GraphQL expects BigInt as string
  transactionHash?: string;
}

/**
 * Typed where conditions for NetworkInfo entity
 */
export interface NetworkInfoWhereInput {
  id?: NetworkName; // The ID is typically the network name in this entity
  totalPaymasters_gte?: string;
  totalPaymasters_lte?: string;
  totalPools_gte?: string;
  totalPools_lte?: string;
  totalMembers_gte?: string;
  totalMembers_lte?: string;
  totalUserOperations_gte?: string;
  totalUserOperations_lte?: string;
  totalGasSpent_gte?: string;
  totalGasSpent_lte?: string;
  totalRevenue_gte?: string;
  totalRevenue_lte?: string;
  firstDeploymentTimestamp_gte?: string;
  firstDeploymentTimestamp_lte?: string;
  lastActivityTimestamp_gte?: string;
  lastActivityTimestamp_lte?: string;
}

/**
 * Typed where conditions for NullifierUsage entity
 */
export interface NullifierUsageWhereInput {
  id?: string;
  nullifier?: string;
  nullifier_in?: string[];
  paymasterAddress?: string;
  paymasterAddress_in?: string[];
  paymasterType?: PaymasterType;
  paymasterType_in?: PaymasterType[];
  poolId?: string;
  poolId_in?: string[];
  network?: NetworkName;
  network_in?: NetworkName[];
  isUsed?: boolean;
  gasUsed_gte?: string;
  gasUsed_lte?: string;
  userOperation_not?: string; // To check if userOperation is not null/empty
  firstUsedAtTimestamp_gte?: string;
  firstUsedAtTimestamp_lte?: string;
  lastUpdatedTimestamp_gte?: string;
  lastUpdatedTimestamp_lte?: string;
  createdAtBlock?: string;
  createdAtBlock_gte?: string;
  createdAtBlock_lte?: string;
  createdAtTimestamp?: string;
  createdAtTimestamp_gte?: string;
  createdAtTimestamp_lte?: string;
}

/**
 * Typed where conditions for DailyPoolStats entity
 */
export interface DailyPoolStatsWhereInput {
  id?: string;
  poolId?: string;
  poolId_in?: string[];
  network?: NetworkName;
  network_in?: NetworkName[];
  date?: string;
  date_gte?: string;
  date_lte?: string;
  newMembers_gte?: string;
  newMembers_lte?: string;
  userOperations_gte?: string;
  userOperations_lte?: string;
  gasSpent_gte?: string;
  gasSpent_lte?: string;
  revenueGenerated_gte?: string;
  revenueGenerated_lte?: string;
  totalMembers_gte?: string;
  totalMembers_lte?: string;
  totalDeposits_gte?: string;
  totalDeposits_lte?: string;
  createdAtBlock?: string;
  createdAtBlock_gte?: string;
  createdAtBlock_lte?: string;
  createdAtTimestamp?: string;
  createdAtTimestamp_gte?: string;
  createdAtTimestamp_lte?: string;
}

/**
 * Typed where conditions for DailyGlobalStats entity
 */
export interface DailyGlobalStatsWhereInput {
  id?: string; // The ID of DailyGlobalStats is typically a combination of network and date (e.g., "base-sepolia-2024-01-01")
  network_in?: NetworkName[]; // For filtering by network (if the ID isn't directly the network)
  date?: string; // For a specific date query (if ID is not used for this)
  date_gte?: string;
  date_lte?: string;
  newPools_gte?: string;
  newPools_lte?: string;
  totalNewMembers_gte?: string;
  totalNewMembers_lte?: string;
  totalUserOperations_gte?: string;
  totalUserOperations_lte?: string;
  totalGasSpent_gte?: string;
  totalGasSpent_lte?: string;
  totalRevenueGenerated_gte?: string;
  totalRevenueGenerated_lte?: string;
  totalActivePools_gte?: string;
  totalActivePools_lte?: string;
  totalMembers_gte?: string;
  totalMembers_lte?: string;
}
