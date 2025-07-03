import type { SubgraphClient } from "../client/subgraph-client.js";
import { PoolQueryBuilder } from "./builders/pool-query-builder.js";
import { PoolMemberQueryBuilder } from "./builders/member-query-builder.js";
import { PaymasterContractQueryBuilder } from "./builders/paymaster-query-builder.js";
import { UserOperationQueryBuilder } from "./builders/user-operation-query-builder.js";
import {
  DailyPoolStatsQueryBuilder,
  DailyGlobalStatsQueryBuilder,
} from "./builders/analytics-query-builder.js";
import { RevenueWithdrawalQueryBuilder } from "./builders/revenue-query-builder.js";
import { NullifierUsageQueryBuilder } from "./builders/nullifier-usage-query-builder.js";

/**
 * Main query builder that provides access to all entity-specific query builders
 *
 * This is the entry point for the fluent query API. It provides methods to start
 * building queries for different entity types and includes convenience methods
 * for common cross-entity queries.
 *
 * Updated to include all new entity query builders for the enhanced subgraph schema.
 */
export class QueryBuilder {
  constructor(private client: SubgraphClient) {}

  /**
   * Start building a paymaster contract query
   *
   * @returns PaymasterContractQueryBuilder for fluent paymaster queries
   *
   * @example
   * ```typescript
   * const paymasters = await query.paymasters()
   *   .byType("GasLimited")
   *   .withMinRevenue("1000000000000000000") // 1 ETH
   *   .orderByRevenue()
   *   .limit(10)
   *   .execute();
   * ```
   */
  paymasters(): PaymasterContractQueryBuilder {
    return new PaymasterContractQueryBuilder(this.client);
  }

  /**
   * Start building a pools query
   *
   * @returns PoolQueryBuilder for fluent pool queries
   *
   * @example
   * ```typescript
   * const pools = await query.pools()
   *   .select("poolId", "joiningFee", "memberCount")
   *   .withMinMembers(5)
   *   .maxJoiningFee("1000000000000000000") // 1 ETH
   *   .orderByPopularity()
   *   .limit(20)
   *   .execute();
   * ```
   */
  pools(): PoolQueryBuilder {
    return new PoolQueryBuilder(this.client);
  }

  /**
   * Start building a pool members query
   *
   * @returns PoolMemberQueryBuilder for fluent member queries
   *
   * @example
   * ```typescript
   * const members = await query.members()
   *   .inPool("1")
   *   .select("identityCommitment", "addedAtTimestamp", "memberIndex")
   *   .orderByNewestAdded()
   *   .limit(50)
   *   .execute();
   * ```
   */
  members(): PoolMemberQueryBuilder {
    return new PoolMemberQueryBuilder(this.client);
  }

  /**
   * Start building a user operations query
   *
   * @returns UserOperationQueryBuilder for fluent user operation queries
   *
   * @example
   * ```typescript
   * const userOps = await query.userOperations()
   *   .bySender("0x123...")
   *   .byPaymaster("0x456...")
   *   .withMinGasCost("1000000000000000") // 0.001 ETH
   *   .orderByNewestExecuted()
   *   .limit(100)
   *   .execute();
   * ```
   */
  userOperations(): UserOperationQueryBuilder {
    return new UserOperationQueryBuilder(this.client);
  }

  /**
   * Start building a revenue withdrawals query
   *
   * @returns RevenueWithdrawalQueryBuilder for fluent revenue withdrawal queries
   *
   * @example
   * ```typescript
   * const withdrawals = await query.revenueWithdrawals()
   *   .byPaymaster("0x456...")
   *   .withMinAmount("1000000000000000000") // 1 ETH
   *   .orderByNewestWithdrawn()
   *   .limit(50)
   *   .execute();
   * ```
   */
  revenueWithdrawals(): RevenueWithdrawalQueryBuilder {
    return new RevenueWithdrawalQueryBuilder(this.client);
  }

  /**
   * Start building a nullifier usage query
   *
   * @returns NullifierUsageQueryBuilder for fluent nullifier usage queries
   *
   * @example
   * ```typescript
   * const nullifierUsage = await query.nullifierUsage()
   *   .byPool("1")
   *   .usedOnly()
   *   .withMinGasUsed("1000000000000000") // 0.001 ETH
   *   .orderByNewestUsed()
   *   .limit(100)
   *   .execute();
   * ```
   */
  nullifierUsage(): NullifierUsageQueryBuilder {
    return new NullifierUsageQueryBuilder(this.client);
  }

  /**
   * Start building a daily pool stats query
   *
   * @returns DailyPoolStatsQueryBuilder for fluent daily pool stats queries
   *
   * @example
   * ```typescript
   * const poolStats = await query.dailyPoolStats()
   *   .forPool("1")
   *   .forDateRange("2024-01-01", "2024-01-31")
   *   .withMinNewMembers(5)
   *   .orderByNewest()
   *   .execute();
   * ```
   */
  dailyPoolStats(): DailyPoolStatsQueryBuilder {
    return new DailyPoolStatsQueryBuilder(this.client);
  }

  /**
   * Start building a daily global stats query
   *
   * @returns DailyGlobalStatsQueryBuilder for fluent daily global stats queries
   *
   * @example
   * ```typescript
   * const globalStats = await query.dailyGlobalStats()
   *   .forDateRange("2024-01-01", "2024-01-31")
   *   .withMinNewPools(2)
   *   .orderByNewest()
   *   .execute();
   * ```
   */
  dailyGlobalStats(): DailyGlobalStatsQueryBuilder {
    return new DailyGlobalStatsQueryBuilder(this.client);
  }

  /**
   * ========================================
   * CONVENIENCE METHODS
   * ========================================
   */

  /**
   * Get popular pools (convenience method)
   *
   * @param minMembers - Minimum number of members to consider popular
   * @param limit - Maximum number of pools to return
   * @returns Promise resolving to array of popular pools
   *
   * @example
   * ```typescript
   * const popularPools = await query.getPopularPools(10, 20);
   * ```
   */
  async getPopularPools(minMembers: number = 10, limit: number = 20) {
    return await this.pools()
      .withMinMembers(minMembers)
      .orderByPopularity()
      .limit(limit)
      .execute();
  }

  /**
   * Get affordable pools (convenience method)
   *
   * @param maxJoiningFee - Maximum joining fee in wei
   * @param limit - Maximum number of pools to return
   * @returns Promise resolving to array of affordable pools
   *
   * @example
   * ```typescript
   * const affordablePools = await query.getAffordablePools("100000000000000000", 15); // 0.1 ETH max
   * ```
   */
  async getAffordablePools(maxJoiningFee: string, limit: number = 20) {
    return await this.pools()
      .maxJoiningFee(maxJoiningFee)
      .orderByAffordability()
      .limit(limit)
      .execute();
  }

  /**
   * Get newest pools (convenience method)
   *
   * @param limit - Maximum number of pools to return
   * @returns Promise resolving to array of newest pools
   *
   * @example
   * ```typescript
   * const newestPools = await query.getNewestPools(10);
   * ```
   */
  async getNewestPools(limit: number = 20) {
    return await this.pools().orderByNewest().limit(limit).execute();
  }

  /**
   * Get pools by paymaster type (convenience method)
   *
   * @param paymasterType - Type of paymaster ("GasLimited" or "OneTimeUse")
   * @param limit - Maximum number of pools to return
   * @returns Promise resolving to array of pools from specified paymaster type
   *
   * @example
   * ```typescript
   * const gasLimitedPools = await query.getPoolsByPaymasterType("GasLimited", 25);
   * ```
   */
  async getPoolsByPaymasterType(
    paymasterType: "GasLimited" | "OneTimeUse",
    limit: number = 20,
  ) {
    const paymasters = await this.paymasters().byType(paymasterType).execute();

    const paymasterAddresses = paymasters.map((p) => p.address);

    return await this.pools()
      .byPaymasters(paymasterAddresses)
      .orderByNewest()
      .limit(limit)
      .execute();
  }

  /**
   * Get user's pool memberships (convenience method)
   *
   * @param identityCommitment - Identity commitment to search for
   * @param limit - Maximum number of memberships to return
   * @returns Promise resolving to array of pool memberships
   *
   * @example
   * ```typescript
   * const memberships = await query.getUserPoolMemberships("0x123...", 10);
   * ```
   */
  async getUserPoolMemberships(identityCommitment: string, limit: number = 20) {
    return await this.members().findPoolsByIdentity(identityCommitment, {
      first: limit,
    });
  }

  /**
   * Get user's transaction history (convenience method)
   *
   * @param senderAddress - Sender address to search for
   * @param limit - Maximum number of operations to return
   * @returns Promise resolving to array of user operations
   *
   * @example
   * ```typescript
   * const userHistory = await query.getUserTransactionHistory("0x123...", 50);
   * ```
   */
  async getUserTransactionHistory(senderAddress: string, limit: number = 50) {
    return await this.userOperations()
      .bySender(senderAddress)
      .orderByNewestExecuted()
      .limit(limit)
      .withRelated()
      .execute();
  }

  /**
   * Get paymaster performance stats (convenience method)
   *
   * @param paymasterAddress - Paymaster contract address
   * @returns Promise resolving to paymaster performance data
   *
   * @example
   * ```typescript
   * const stats = await query.getPaymasterStats("0x456...");
   * ```
   */
  async getPaymasterStats(paymasterAddress: string) {
    const paymaster = await this.paymasters()
      .byAddress(paymasterAddress)
      .withRelated()
      .first();

    if (!paymaster) {
      return null;
    }

    const userOps = await this.userOperations()
      .byPaymaster(paymasterAddress)
      .execute();

    const totalGasSpent = userOps.reduce((total, op) => {
      return (BigInt(total) + op.actualGasCost).toString();
    }, "0");

    const avgGasCost =
      userOps.length > 0
        ? (BigInt(totalGasSpent) / BigInt(userOps.length)).toString()
        : "0";

    return {
      paymaster,
      totalUserOperations: userOps.length,
      totalGasSpent,
      averageGasCost: avgGasCost,
      totalPools: paymaster.pools.length,
      totalWithdrawals: paymaster.revenueWithdrawals.length,
    };
  }

  /**
   * Get pool analytics (convenience method)
   *
   * @param poolId - Pool ID to analyze
   * @returns Promise resolving to pool analytics data
   *
   * @example
   * ```typescript
   * const analytics = await query.getPoolAnalytics("1");
   * ```
   */
  async getPoolAnalytics(poolId: string) {
    const pool = await this.pools().byId(poolId).withMembers().first();

    if (!pool) {
      return null;
    }

    const userOps = await this.userOperations().byPool(poolId).execute();

    const totalGasSpent = userOps.reduce((total, op) => {
      return (BigInt(total) + op.actualGasCost).toString();
    }, "0");

    const avgGasCostPerOperation =
      userOps.length > 0
        ? (BigInt(totalGasSpent) / BigInt(userOps.length)).toString()
        : "0";

    const avgGasCostPerMember =
      pool.members.length > 0
        ? (BigInt(totalGasSpent) / BigInt(pool.members.length)).toString()
        : "0";

    return {
      pool,
      totalUserOperations: userOps.length,
      totalGasSpent,
      averageGasCostPerOperation: avgGasCostPerOperation,
      averageGasCostPerMember: avgGasCostPerMember,
      utilizationRate:
        pool.members.length > 0
          ? ((userOps.length / pool.members.length) * 100).toFixed(2) + "%"
          : "0%",
    };
  }

  /**
   * Get network overview (convenience method)
   *
   * @returns Promise resolving to network overview data
   *
   * @example
   * ```typescript
   * const overview = await query.getNetworkOverview();
   * ```
   */
  async getNetworkOverview() {
    const [paymasters, pools, recentUserOps] = await Promise.all([
      this.paymasters().execute(),
      this.pools().execute(),
      this.userOperations().orderByNewestExecuted().limit(100).execute(),
    ]);

    const gasLimitedPaymasters = paymasters.filter(
      (p) => p.contractType === "GasLimited",
    );
    const oneTimeUsePaymasters = paymasters.filter(
      (p) => p.contractType === "OneTimeUse",
    );

    const totalMembers = pools.reduce((total, pool) => {
      return total + Number(pool.memberCount);
    }, 0);

    const totalDeposits = pools.reduce((total, pool) => {
      return (BigInt(total) + pool.totalDeposits).toString();
    }, "0");

    const totalRevenue = paymasters.reduce((total, paymaster) => {
      return (BigInt(total) + paymaster.revenue).toString();
    }, "0");

    const totalGasSpent = recentUserOps.reduce((total, op) => {
      return (BigInt(total) + op.actualGasCost).toString();
    }, "0");

    return {
      totalPaymasters: paymasters.length,
      gasLimitedPaymasters: gasLimitedPaymasters.length,
      oneTimeUsePaymasters: oneTimeUsePaymasters.length,
      totalPools: pools.length,
      totalMembers,
      totalDeposits,
      totalRevenue,
      recentUserOperations: recentUserOps.length,
      totalGasSpent,
    };
  }

  /**
   * Get revenue analytics (convenience method)
   *
   * @param paymasterAddress - Paymaster contract address (optional)
   * @param dateRange - Date range filter (optional)
   * @returns Promise resolving to revenue analytics data
   *
   * @example
   * ```typescript
   * const revenueAnalytics = await query.getRevenueAnalytics("0x456...", {
   *   startDate: "2024-01-01",
   *   endDate: "2024-01-31"
   * });
   * ```
   */
  async getRevenueAnalytics(
    paymasterAddress?: string,
    dateRange?: { startDate: string; endDate: string },
  ) {
    let withdrawalQuery = this.revenueWithdrawals();

    if (paymasterAddress) {
      withdrawalQuery = withdrawalQuery.byPaymaster(paymasterAddress);
    }

    if (dateRange) {
      withdrawalQuery = withdrawalQuery.withdrawnBetween(
        new Date(dateRange.startDate).getTime().toString(),
        new Date(dateRange.endDate).getTime().toString(),
      );
    }

    const withdrawals = await withdrawalQuery.execute();

    const totalWithdrawals = withdrawals.length;
    const totalWithdrawnAmount = withdrawals.reduce((total, withdrawal) => {
      return (BigInt(total) + withdrawal.amount).toString();
    }, "0");

    const avgWithdrawalAmount =
      totalWithdrawals > 0
        ? (BigInt(totalWithdrawnAmount) / BigInt(totalWithdrawals)).toString()
        : "0";

    // Get unique recipients
    const uniqueRecipients = new Set(withdrawals.map((w) => w.recipient));

    return {
      totalWithdrawals,
      totalWithdrawnAmount,
      averageWithdrawalAmount: avgWithdrawalAmount,
      uniqueRecipients: uniqueRecipients.size,
      withdrawals: withdrawals.slice(0, 10), // Latest 10 withdrawals
    };
  }

  /**
   * Get usage analytics (convenience method)
   *
   * @param paymasterAddress - Paymaster contract address (optional)
   * @param poolId - Pool ID filter (optional)
   * @returns Promise resolving to usage analytics data
   *
   * @example
   * ```typescript
   * const usageAnalytics = await query.getUsageAnalytics("0x456...", "1");
   * ```
   */
  async getUsageAnalytics(paymasterAddress?: string, poolId?: string) {
    let nullifierQuery = this.nullifierUsage();

    if (paymasterAddress) {
      nullifierQuery = nullifierQuery.byPaymaster(paymasterAddress);
    }

    if (poolId) {
      nullifierQuery = nullifierQuery.byPool(poolId);
    }

    const nullifierUsages = await nullifierQuery.execute();

    const totalNullifiers = nullifierUsages.length;
    const usedNullifiers = nullifierUsages.filter(
      (usage) => usage.isUsed,
    ).length;
    const unusedNullifiers = totalNullifiers - usedNullifiers;

    const totalGasUsed = nullifierUsages.reduce((total, usage) => {
      return (BigInt(total) + usage.gasUsed).toString();
    }, "0");

    const avgGasUsed =
      usedNullifiers > 0
        ? (BigInt(totalGasUsed) / BigInt(usedNullifiers)).toString()
        : "0";

    return {
      totalNullifiers,
      usedNullifiers,
      unusedNullifiers,
      usageRate:
        totalNullifiers > 0
          ? ((usedNullifiers / totalNullifiers) * 100).toFixed(2) + "%"
          : "0%",
      totalGasUsed,
      averageGasUsed: avgGasUsed,
    };
  }

  /**
   * Get time series analytics (convenience method)
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param poolId - Pool ID filter (optional)
   * @returns Promise resolving to time series data
   *
   * @example
   * ```typescript
   * const timeSeries = await query.getTimeSeriesAnalytics("2024-01-01", "2024-01-31", "1");
   * ```
   */
  async getTimeSeriesAnalytics(
    startDate: string,
    endDate: string,
    poolId?: string,
  ) {
    const [globalStats, poolStats] = await Promise.all([
      this.dailyGlobalStats()
        .forDateRange(startDate, endDate)
        .orderByOldest()
        .execute(),
      poolId
        ? this.dailyPoolStats()
            .forPool(poolId)
            .forDateRange(startDate, endDate)
            .orderByOldest()
            .execute()
        : Promise.resolve([]),
    ]);

    return {
      globalStats,
      poolStats,
      dateRange: { startDate, endDate },
      poolId,
    };
  }

  /**
   * Search across multiple entities (convenience method)
   *
   * @param query - Search query string
   * @param limit - Maximum results per entity type
   * @returns Promise resolving to search results across all entities
   *
   * @example
   * ```typescript
   * const results = await query.search("0x123", 10);
   * ```
   */
  async search(query: string, limit: number = 10) {
    const [pools, members, userOps, paymasters, withdrawals, nullifierUsage] =
      await Promise.all([
        this.pools()
          .where({ poolId_contains: query })
          .limit(limit)
          .execute()
          .catch(() => []),

        this.members()
          .identityContains(query)
          .limit(limit)
          .execute()
          .catch(() => []),

        this.userOperations()
          .hashContains(query)
          .limit(limit)
          .execute()
          .catch(() => []),

        this.paymasters()
          .addressContains(query)
          .limit(limit)
          .execute()
          .catch(() => []),

        this.revenueWithdrawals()
          .recipientContains(query)
          .limit(limit)
          .execute()
          .catch(() => []),

        this.nullifierUsage()
          .nullifierContains(query)
          .limit(limit)
          .execute()
          .catch(() => []),
      ]);

    return {
      pools,
      members,
      userOperations: userOps,
      paymasters,
      revenueWithdrawals: withdrawals,
      nullifierUsage,
      totalResults:
        pools.length +
        members.length +
        userOps.length +
        paymasters.length +
        withdrawals.length +
        nullifierUsage.length,
    };
  }

  /**
   * Get the underlying SubgraphClient for advanced operations
   *
   * @returns The SubgraphClient instance
   *
   * @example
   * ```typescript
   * const client = query.getClient();
   * const customResponse = await client.executeQuery(customQuery, variables);
   * ```
   */
  getClient(): SubgraphClient {
    return this.client;
  }
}
