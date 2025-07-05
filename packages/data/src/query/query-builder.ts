/**
 * Main query builder that provides access to all entity-specific query builders
 * Updated for the new network-aware schema structure
 *
 * This is the entry point for the fluent query API. It provides methods to start
 * building queries for different entity types and includes convenience methods
 * for common cross-entity queries.
 */

import type { SubgraphClient } from "../client/subgraph-client.js";
import type { NetworkName } from "../types/subgraph.js";
import { PaymasterContractQueryBuilder } from "./builders/paymaster-query-builder.js";
import { PoolQueryBuilder } from "./builders/pool-query-builder.js";
import { PoolMemberQueryBuilder } from "./builders/member-query-builder.js";
import { MerkleRootQueryBuilder } from "./builders/merkle-root-query-builder.js";
import { UserOperationQueryBuilder } from "./builders/user-operation-query-builder.js";
import { RevenueWithdrawalQueryBuilder } from "./builders/revenue-query-builder.js";
import { NullifierUsageQueryBuilder } from "./builders/nullifier-usage-query-builder.js";
import { DailyPoolStatsQueryBuilder } from "./builders/daily-pool-stats-query-builder.js";
import { DailyGlobalStatsQueryBuilder } from "./builders/daily-global-stats-query-builder.js";
import { NetworkInfoQueryBuilder } from "./builders/network-info-query-builder.js";

/**
 * Main query builder that provides access to all entity-specific query builders
 *
 * This class serves as the entry point for the fluent query API and provides
 * methods to start building queries for different entity types.
 */
export class QueryBuilder {
  constructor(private client: SubgraphClient) {}

  /**
   * ========================================
   * ENTITY-SPECIFIC QUERY BUILDERS
   * ========================================
   */

  /**
   * Start building a query for paymaster contracts
   *
   * @returns PaymasterContractQueryBuilder for fluent query building
   *
   * @example
   * ```typescript
   * const paymasters = await client.query()
   *   .paymasters()
   *   .byNetwork("base-sepolia")
   *   .byType("GasLimited")
   *   .withMinRevenue("1000000000000000000")
   *   .orderByRevenue()
   *   .limit(10)
   *   .execute();
   * ```
   */
  paymasters(): PaymasterContractQueryBuilder {
    return new PaymasterContractQueryBuilder(this.client);
  }

  /**
   * Start building a query for pools
   *
   * @returns PoolQueryBuilder for fluent query building
   *
   * @example
   * ```typescript
   * const pools = await client.query()
   *   .pools()
   *   .byNetwork("base-sepolia")
   *   .byPaymaster("0x456...")
   *   .withMinMembers(10)
   *   .orderByPopularity()
   *   .limit(20)
   *   .execute();
   * ```
   */
  pools(): PoolQueryBuilder {
    return new PoolQueryBuilder(this.client);
  }

  /**
   * Start building a query for pool members
   *
   * @returns PoolMemberQueryBuilder for fluent query building
   *
   * @example
   * ```typescript
   * const members = await client.query()
   *   .poolMembers()
   *   .byNetwork("base-sepolia")
   *   .byPool("123")
   *   .withNullifierUsed()
   *   .orderByJoinDate()
   *   .limit(50)
   *   .execute();
   * ```
   */
  poolMembers(): PoolMemberQueryBuilder {
    return new PoolMemberQueryBuilder(this.client);
  }

  /**
   * Start building a query for merkle roots
   *
   * @returns MerkleRootQueryBuilder for fluent query building
   *
   * @example
   * ```typescript
   * const roots = await client.query()
   *   .merkleRoots()
   *   .byNetwork("base-sepolia")
   *   .byPool("123")
   *   .orderByIndex()
   *   .limit(100)
   *   .execute();
   * ```
   */
  merkleRoots(): MerkleRootQueryBuilder {
    return new MerkleRootQueryBuilder(this.client);
  }

  /**
   * Start building a query for user operations
   *
   * @returns UserOperationQueryBuilder for fluent query building
   *
   * @example
   * ```typescript
   * const userOps = await client.query()
   *   .userOperations()
   *   .byNetwork("base-sepolia")
   *   .byPaymaster("0x456...")
   *   .bySender("0x789...")
   *   .orderByTimestamp()
   *   .limit(25)
   *   .execute();
   * ```
   */
  userOperations(): UserOperationQueryBuilder {
    return new UserOperationQueryBuilder(this.client);
  }

  /**
   * Start building a query for revenue withdrawals
   *
   * @returns RevenueWithdrawalQueryBuilder for fluent query building
   *
   * @example
   * ```typescript
   * const withdrawals = await client.query()
   *   .revenueWithdrawals()
   *   .byNetwork("base-sepolia")
   *   .byPaymaster("0x456...")
   *   .withMinAmount("1000000000000000000")
   *   .orderByAmount()
   *   .limit(10)
   *   .execute();
   * ```
   */
  revenueWithdrawals(): RevenueWithdrawalQueryBuilder {
    return new RevenueWithdrawalQueryBuilder(this.client);
  }

  /**
   * Start building a query for nullifier usage (enhanced)
   *
   * @returns NullifierUsageQueryBuilder for fluent query building
   *
   * @example
   * ```typescript
   * const nullifierUsage = await client.query()
   *   .nullifierUsage()
   *   .byNetwork("base-sepolia")
   *   .byPaymaster("0x456...")
   *   .onlyUsed()
   *   .withGasUsed()
   *   .orderByUsage()
   *   .limit(100)
   *   .execute();
   * ```
   */
  nullifierUsage(): NullifierUsageQueryBuilder {
    return new NullifierUsageQueryBuilder(this.client);
  }

  /**
   * Start building a query for daily pool statistics
   *
   * @returns DailyPoolStatsQueryBuilder for fluent query building
   *
   * @example
   * ```typescript
   * const poolStats = await client.query()
   *   .dailyPoolStats()
   *   .byNetwork("base-sepolia")
   *   .byPool("123")
   *   .forDateRange("2024-01-01", "2024-01-31")
   *   .orderByDate()
   *   .execute();
   * ```
   */
  dailyPoolStats(): DailyPoolStatsQueryBuilder {
    return new DailyPoolStatsQueryBuilder(this.client);
  }

  /**
   * Start building a query for daily global statistics
   *
   * @returns DailyGlobalStatsQueryBuilder for fluent query building
   *
   * @example
   * ```typescript
   * const globalStats = await client.query()
   *   .dailyGlobalStats()
   *   .byNetwork("base-sepolia")
   *   .forDateRange("2024-01-01", "2024-01-31")
   *   .withMinNewPools(2)
   *   .orderByDate()
   *   .execute();
   * ```
   */
  dailyGlobalStats(): DailyGlobalStatsQueryBuilder {
    return new DailyGlobalStatsQueryBuilder(this.client);
  }

  /**
   * Start building a query for network information
   *
   * @returns NetworkInfoQueryBuilder for fluent query building
   *
   * @example
   * ```typescript
   * const networkInfo = await client.query()
   *   .networkInfo()
   *   .byNetwork("base-sepolia")
   *   .execute();
   * ```
   */
  networkInfo(): NetworkInfoQueryBuilder {
    return new NetworkInfoQueryBuilder(this.client);
  }

  /**
   * ========================================
   * CONVENIENCE METHODS
   * ========================================
   */

  /**
   * Get all data for a specific network
   *
   * @param network - Network identifier
   * @returns Promise with comprehensive network data
   *
   * @example
   * ```typescript
   * const networkData = await client.query().getNetworkOverview("base-sepolia");
   * console.log(networkData.paymasters.length);
   * console.log(networkData.pools.length);
   * console.log(networkData.networkInfo.totalMembers);
   * ```
   */
  async getNetworkOverview(network: NetworkName): Promise<{
    networkInfo: any;
    paymasters: any[];
    pools: any[];
    recentUserOps: any[];
    recentWithdrawals: any[];
    dailyStats: any[];
  }> {
    const [
      networkInfo,
      paymasters,
      pools,
      recentUserOps,
      recentWithdrawals,
      dailyStats,
    ] = await Promise.all([
      this.networkInfo().byNetwork(network).first(),
      this.paymasters().byNetwork(network).limit(10).execute(),
      this.pools().byNetwork(network).limit(20).execute(),
      this.userOperations().byNetwork(network).limit(10).execute(),
      this.revenueWithdrawals().byNetwork(network).limit(5).execute(),
      this.dailyGlobalStats().byNetwork(network).limit(30).execute(),
    ]);

    return {
      networkInfo,
      paymasters,
      pools,
      recentUserOps,
      recentWithdrawals,
      dailyStats,
    };
  }

  /**
   * Get comprehensive pool data with related entities
   *
   * @param poolId - Pool ID
   * @param network - Network identifier
   * @returns Promise with comprehensive pool data
   *
   * @example
   * ```typescript
   * const poolData = await client.query().getPoolOverview("123", "base-sepolia");
   * console.log(poolData.pool.memberCount);
   * console.log(poolData.members.length);
   * console.log(poolData.userOperations.length);
   * ```
   */
  async getPoolOverview(
    poolId: string,
    network: NetworkName,
  ): Promise<{
    pool: any;
    members: any[];
    merkleRoots: any[];
    userOperations: any[];
    nullifierUsage: any[];
    dailyStats: any[];
  }> {
    const [
      pool,
      members,
      merkleRoots,
      userOperations,
      nullifierUsage,
      dailyStats,
    ] = await Promise.all([
      this.pools().byNetwork(network).byPoolId(poolId).first(),
      this.poolMembers().byNetwork(network).byPool(poolId).limit(100).execute(),
      this.merkleRoots().byNetwork(network).byPool(poolId).limit(50).execute(),
      this.userOperations()
        .byNetwork(network)
        .byPool(poolId)
        .limit(50)
        .execute(),
      this.nullifierUsage()
        .byNetwork(network)
        .byPool(poolId)
        .limit(100)
        .execute(),
      this.dailyPoolStats()
        .byNetwork(network)
        .byPool(poolId)
        .limit(90)
        .execute(),
    ]);

    return {
      pool,
      members,
      merkleRoots,
      userOperations,
      nullifierUsage,
      dailyStats,
    };
  }

  /**
   * Get user activity across all pools and paymasters
   *
   * @param identityCommitment - User's identity commitment
   * @param network - Network identifier
   * @returns Promise with user activity data
   *
   * @example
   * ```typescript
   * const userActivity = await client.query().getUserActivity("0x123...", "base-sepolia");
   * console.log(userActivity.poolMemberships.length);
   * console.log(userActivity.userOperations.length);
   * ```
   */
  async getUserActivity(
    identityCommitment: string,
    network: NetworkName,
  ): Promise<{
    poolMemberships: any[];
    userOperations: any[];
    nullifierUsage: any[];
  }> {
    const [poolMemberships, userOperations, nullifierUsage] = await Promise.all(
      [
        this.poolMembers()
          .byNetwork(network)
          .byIdentityCommitment(identityCommitment)
          .execute(),
        this.userOperations().byNetwork(network).limit(100).execute(), // Note: Would need sender filtering
        this.nullifierUsage().byNetwork(network).limit(100).execute(), // Note: Would need nullifier filtering
      ],
    );

    return {
      poolMemberships,
      userOperations,
      nullifierUsage,
    };
  }

  /**
   * Get paymaster performance metrics
   *
   * @param paymasterAddress - Paymaster contract address
   * @param network - Network identifier
   * @returns Promise with paymaster performance data
   *
   * @example
   * ```typescript
   * const metrics = await client.query().getPaymasterMetrics("0x456...", "base-sepolia");
   * console.log(metrics.paymaster.revenue);
   * console.log(metrics.pools.length);
   * console.log(metrics.userOperations.length);
   * ```
   */
  async getPaymasterMetrics(
    paymasterAddress: string,
    network: NetworkName,
  ): Promise<{
    paymaster: any;
    pools: any[];
    userOperations: any[];
    revenueWithdrawals: any[];
    nullifierUsage: any[];
  }> {
    const [
      paymaster,
      pools,
      userOperations,
      revenueWithdrawals,
      nullifierUsage,
    ] = await Promise.all([
      this.paymasters().byNetwork(network).byAddress(paymasterAddress).first(),
      this.pools().byNetwork(network).byPaymaster(paymasterAddress).execute(),
      this.userOperations()
        .byNetwork(network)
        .byPaymaster(paymasterAddress)
        .limit(100)
        .execute(),
      this.revenueWithdrawals()
        .byNetwork(network)
        .byPaymaster(paymasterAddress)
        .execute(),
      this.nullifierUsage()
        .byNetwork(network)
        .byPaymaster(paymasterAddress)
        .limit(100)
        .execute(),
    ]);

    return {
      paymaster,
      pools,
      userOperations,
      revenueWithdrawals,
      nullifierUsage,
    };
  }

  /**
   * Get analytics data for a date range
   *
   * @param network - Network identifier
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Promise with analytics data
   *
   * @example
   * ```typescript
   * const analytics = await client.query().getAnalytics("base-sepolia", "2024-01-01", "2024-01-31");
   * console.log(analytics.globalStats.length);
   * console.log(analytics.poolStats.length);
   * ```
   */
  async getAnalytics(
    network: NetworkName,
    startDate: string,
    endDate: string,
  ): Promise<{
    globalStats: any[];
    poolStats: any[];
    totalGasSpent: string;
    totalRevenue: string;
    activePools: number;
  }> {
    const [globalStats, poolStats] = await Promise.all([
      this.dailyGlobalStats()
        .byNetwork(network)
        .forDateRange(startDate, endDate)
        .orderByDate()
        .execute(),
      this.dailyPoolStats()
        .byNetwork(network)
        .forDateRange(startDate, endDate)
        .orderByDate()
        .execute(),
    ]);

    // Calculate aggregated metrics
    const totalGasSpent = globalStats.reduce(
      (sum, stat) => sum + BigInt(stat.totalGasSpent),
      0n,
    );
    const totalRevenue = globalStats.reduce(
      (sum, stat) => sum + BigInt(stat.totalRevenueGenerated),
      0n,
    );
    const activePools =
      globalStats[globalStats.length - 1]?.totalActivePools || 0;

    return {
      globalStats,
      poolStats,
      totalGasSpent: totalGasSpent.toString(),
      totalRevenue: totalRevenue.toString(),
      activePools: parseInt(activePools.toString()),
    };
  }

  /**
   * Search for entities across multiple types
   *
   * @param query - Search query
   * @param network - Network identifier
   * @returns Promise with search results
   *
   * @example
   * ```typescript
   * const results = await client.query().search("0x123...", "base-sepolia");
   * console.log(results.paymasters.length);
   * console.log(results.pools.length);
   * console.log(results.userOperations.length);
   * ```
   */
  async search(
    query: string,
    network: NetworkName,
  ): Promise<{
    paymasters: any[];
    pools: any[];
    userOperations: any[];
    poolMembers: any[];
  }> {
    const isAddress = /^0x[a-fA-F0-9]{40}$/i.test(query);
    const isHash = /^0x[a-fA-F0-9]{64}$/i.test(query);
    const isNumber = /^\d+$/.test(query);

    const searchPromises: Promise<any>[] = [];

    if (isAddress) {
      // Search by address
      searchPromises.push(
        this.paymasters().byNetwork(network).byAddress(query).execute(),
        this.userOperations().byNetwork(network).bySender(query).execute(),
        this.revenueWithdrawals()
          .byNetwork(network)
          .byRecipient(query)
          .execute(),
      );
    }

    if (isHash) {
      // Search by hash
      searchPromises.push(
        this.userOperations().byNetwork(network).byHash(query).execute(),
      );
    }

    if (isNumber) {
      // Search by ID/index
      searchPromises.push(
        this.pools().byNetwork(network).byPoolId(query).execute(),
        this.poolMembers().byNetwork(network).byMemberIndex(query).execute(),
      );
    }

    // Search by identity commitment (if it looks like a big number)
    if (query.length > 10) {
      searchPromises.push(
        this.poolMembers()
          .byNetwork(network)
          .byIdentityCommitment(query)
          .execute(),
      );
    }

    const results = await Promise.allSettled(searchPromises);
    const successfulResults = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<any>).value)
      .flat();

    return {
      paymasters: successfulResults.filter((item) => item.contractType),
      pools: successfulResults.filter(
        (item) => item.poolId && !item.memberIndex,
      ),
      userOperations: successfulResults.filter((item) => item.userOpHash),
      poolMembers: successfulResults.filter(
        (item) => item.memberIndex !== undefined,
      ),
    };
  }

  /**
   * Get real-time network activity
   *
   * @param network - Network identifier
   * @param limit - Number of recent items to fetch
   * @returns Promise with recent activity data
   *
   * @example
   * ```typescript
   * const activity = await client.query().getRecentActivity("base-sepolia", 10);
   * console.log(activity.recentUserOps.length);
   * console.log(activity.recentMembers.length);
   * ```
   */
  async getRecentActivity(
    network: NetworkName,
    limit: number = 10,
  ): Promise<{
    recentUserOps: any[];
    recentMembers: any[];
    recentWithdrawals: any[];
    recentPools: any[];
  }> {
    const [recentUserOps, recentMembers, recentWithdrawals, recentPools] =
      await Promise.all([
        this.userOperations()
          .byNetwork(network)
          .orderByTimestamp()
          .limit(limit)
          .execute(),
        this.poolMembers()
          .byNetwork(network)
          .orderByJoinDate()
          .limit(limit)
          .execute(),
        this.revenueWithdrawals()
          .byNetwork(network)
          .orderByTimestamp()
          .limit(limit)
          .execute(),
        this.pools()
          .byNetwork(network)
          .orderByCreation()
          .limit(limit)
          .execute(),
      ]);

    return {
      recentUserOps,
      recentMembers,
      recentWithdrawals,
      recentPools,
    };
  }
}
