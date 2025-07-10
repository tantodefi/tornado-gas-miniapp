/**
 * AnalyticsClient - Extended subgraph client with analytics capabilities
 *
 * This client extends the core SubgraphClient from @workspace/data to provide
 * specialized analytics functionality including revenue tracking, daily statistics,
 * and advanced metrics calculations.
 */

import { SubgraphClient, type ChainId } from "@workspace/data";
import { DailyPoolStatsQueryBuilder } from "../query/builders/daily-pool-stats-query-builder.js";
import { DailyGlobalStatsQueryBuilder } from "../query/builders/daily-global-stats-query-builder.js";
import { RevenueWithdrawalQueryBuilder } from "../query/builders/revenue-query-builder.js";
import { NullifierUsageQueryBuilder } from "../query/builders/nullifier-usage-query-builder.js";

/**
 * Configuration options specific to analytics client
 */
export interface AnalyticsClientOptions {
  /** Custom subgraph URL (optional, uses default if not provided) */
  subgraphUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Enable debug logging for analytics queries */
  debug?: boolean;
}

/**
 * Extended client for analytics functionality
 *
 * This class extends the core SubgraphClient and adds specialized query builders
 * for analytics entities and advanced metrics calculations.
 *
 * @example
 * ```typescript
 * import { AnalyticsClient } from '@workspace/analytics';
 *
 * // Create analytics client for Base Sepolia
 * const analytics = new AnalyticsClient(84532);
 *
 * // Get daily pool statistics
 * const poolStats = await analytics
 *   .dailyPoolStats()
 *   .byPool("123")
 *   .last30Days()
 *   .execute();
 *
 * // Get revenue metrics
 * const revenueMetrics = await analytics
 *   .revenueWithdrawals()
 *   .byNetwork("base-sepolia")
 *   .getRevenueMetrics();
 * ```
 */
export class AnalyticsClient extends SubgraphClient {
  constructor(chainId: ChainId, options: AnalyticsClientOptions = {}) {
    // Call parent constructor with core options
    super(chainId, {
      subgraphUrl: options.subgraphUrl,
      timeout: options.timeout,
    });

    if (options.debug) {
      console.log("✅ AnalyticsClient initialized:", {
        chainId,
        subgraphUrl: options.subgraphUrl || "default",
        timeout: options.timeout || "default",
      });
    }
  }

  /**
   * Create an AnalyticsClient instance for any supported network by chain ID
   *
   * @param chainId - The chain ID to create analytics client for
   * @param options - Optional configuration overrides
   * @returns Configured AnalyticsClient instance
   *
   * @example
   * ```typescript
   * // Create for Base Sepolia
   * const analytics = AnalyticsClient.createForNetwork(84532);
   *
   * // Create for Base Mainnet with custom options
   * const analytics = AnalyticsClient.createForNetwork(8453, {
   *   subgraphUrl: "https://custom-subgraph.com",
   *   debug: true
   * });
   * ```
   */
  static createForNetwork(
    chainId: ChainId,
    options: AnalyticsClientOptions = {},
  ): AnalyticsClient {
    return new AnalyticsClient(chainId, options);
  }

  /**
   * ========================================
   * ANALYTICS QUERY BUILDERS
   * ========================================
   */

  /**
   * Query builder for daily pool statistics
   *
   * @returns DailyPoolStatsQueryBuilder instance
   *
   * @example
   * ```typescript
   * const stats = await client
   *   .dailyPoolStats()
   *   .byPool("123")
   *   .last7Days()
   *   .orderByDate("desc")
   *   .execute();
   * ```
   */
  dailyPoolStats(): DailyPoolStatsQueryBuilder {
    return new DailyPoolStatsQueryBuilder(this);
  }

  /**
   * Query builder for daily global statistics
   *
   * @returns DailyGlobalStatsQueryBuilder instance
   *
   * @example
   * ```typescript
   * const globalStats = await client
   *   .dailyGlobalStats()
   *   .byNetwork("base-sepolia")
   *   .last30Days()
   *   .execute();
   * ```
   */
  dailyGlobalStats(): DailyGlobalStatsQueryBuilder {
    return new DailyGlobalStatsQueryBuilder(this);
  }

  /**
   * Query builder for revenue withdrawals
   *
   * @returns RevenueQueryBuilder instance
   *
   * @example
   * ```typescript
   * const withdrawals = await client
   *   .revenueWithdrawals()
   *   .byPaymaster("0x...")
   *   .withdrawnAfter(startTime)
   *   .orderByAmount("desc")
   *   .execute();
   * ```
   */
  revenueWithdrawals(): RevenueWithdrawalQueryBuilder {
    return new RevenueWithdrawalQueryBuilder(this);
  }

  /**
   * Query builder for nullifier usage tracking
   *
   * @returns NullifierUsageQueryBuilder instance
   *
   * @example
   * ```typescript
   * const nullifierUsage = await client
   *   .nullifierUsage()
   *   .byPool("123")
   *   .onlyUsed()
   *   .execute();
   * ```
   */
  nullifierUsage(): NullifierUsageQueryBuilder {
    return new NullifierUsageQueryBuilder(this);
  }
}
