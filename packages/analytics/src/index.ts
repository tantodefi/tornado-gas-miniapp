/**
 * @workspace/analytics - Analytics and metrics for prepaid gas paymaster system
 *
 * This package provides specialized analytics functionality for the prepaid gas
 * paymaster system, including revenue tracking, daily statistics, and advanced
 * metrics calculations.
 *
 * This is a separate package from @workspace/data to keep the core data access
 * layer lightweight for basic use cases.
 *
 * @packageDocumentation
 */

/**
 * ========================================
 * ANALYTICS TYPES
 * ========================================
 */

// Analytics-specific entity types
export type {
  DailyPoolStats,
  DailyGlobalStats,
  RevenueWithdrawal,
  NullifierUsage,
} from "./types/subgraph";

// Analytics-specific serialized types
export type {
  SerializedDailyPoolStats,
  SerializedDailyGlobalStats,
  SerializedRevenueWithdrawal,
  SerializedNullifierUsage,
} from "./types/subgraph";

/**
 * ========================================
 * ANALYTICS CLIENT
 * ========================================
 */

// Main analytics client that extends the core SubgraphClient
export { AnalyticsClient } from "./client/analytics-client.js";

/**
 * ========================================
 * DATA TRANSFORMERS (for BigInt serialization)
 * ========================================
 */

// Analytics serialization functions
export {
  serializeDailyPoolStats,
  deserializeDailyPoolStats,
  serializeDailyGlobalStats,
  deserializeDailyGlobalStats,
  serializeRevenueWithdrawal,
  deserializeRevenueWithdrawal,
  serializeNullifierUsage,
  deserializeNullifierUsage,
} from "./transformers";

/**
 * ========================================
 * QUERY BUILDERS
 * ========================================
 */

// Export query builders for direct use if needed
export { DailyPoolStatsQueryBuilder } from "./query/builders/daily-pool-stats-query-builder.js";
export { DailyGlobalStatsQueryBuilder } from "./query/builders/daily-global-stats-query-builder.js";
export { RevenueWithdrawalQueryBuilder } from "./query/builders/revenue-query-builder.js";
export { NullifierUsageQueryBuilder } from "./query/builders/nullifier-usage-query-builder.js";

// Version
export const VERSION = "1.0.0";
