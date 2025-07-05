// daily-pool-stats-query-builder.ts (Refactored)

import type { SubgraphClient } from "../../client/subgraph-client.js";
import type { DailyPoolStats, NetworkName } from "../../types/subgraph.js";
import { DailyPoolStatsFields, DailyPoolStatsWhereInput } from "../types.js";
import { BaseQueryBuilder } from "./base-query-builder.js";

// Define specific types for DailyPoolStatsQueryBuilder

export type DailyPoolStatsOrderBy =
  | "date"
  | "newMembers"
  | "userOperations"
  | "gasSpent"
  | "revenueGenerated"
  | "totalMembers"
  | "totalDeposits"
  | "createdAtBlock"
  | "createdAtTimestamp"; // Assuming these are valid fields for ordering

/**
 * Query builder for DailyPoolStats entities
 *
 * Provides a fluent interface for building daily pool statistics queries
 * with support for date ranges, pool filtering, and performance analysis.
 */
export class DailyPoolStatsQueryBuilder extends BaseQueryBuilder<
  DailyPoolStats,
  DailyPoolStatsFields,
  DailyPoolStatsWhereInput,
  DailyPoolStatsOrderBy
> {
  constructor(private subgraphClient: SubgraphClient) {
    // Default order by date descending
    // Assuming the entity name in the subgraph schema is `dailyPoolStats`
    super(subgraphClient, "dailyPoolStats", "date", "desc");
  }

  /**
   * Override default fields for DailyPoolStats entity.
   * Ensure all relevant fields are included for common use cases.
   */
  protected getDefaultFields(): string {
    return `
      id
      date
      poolId
      network
      newMembers
      userOperations
      gasSpent
      revenueGenerated
      totalMembers
      totalDeposits
      createdAtBlock
      createdAtTimestamp
    `;
  }

  /**
   * ========================================
   * FILTERING METHODS
   * ========================================
   */

  /**
   * Filter by network.
   *
   * @param network - Network identifier.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const poolStats = await client.query().dailyPoolStats()
   * .byNetwork("base-sepolia")
   * .execute();
   * ```
   */
  byNetwork(network: NetworkName): this {
    this.where({ network: network });
    return this;
  }

  /**
   * Filter by pool ID.
   *
   * @param poolId - Pool ID.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const poolStats = await client.query().dailyPoolStats()
   * .byNetwork("base-sepolia")
   * .byPool("123")
   * .execute();
   * ```
   */
  byPool(poolId: string): this {
    this.where({ poolId: poolId });
    return this;
  }

  /**
   * Filter by specific date.
   *
   * @param date - Date in YYYY-MM-DD format.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const dailyStats = await client.query().dailyPoolStats()
   * .byNetwork("base-sepolia")
   * .byPool("123")
   * .forDate("2024-01-15")
   * .first();
   * ```
   */
  forDate(date: string): this {
    this.where({ date: date });
    return this;
  }

  /**
   * Filter by date range.
   *
   * @param startDate - Start date in YYYY-MM-DD format.
   * @param endDate - End date in YYYY-MM-DD format.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const monthlyStats = await client.query().dailyPoolStats()
   * .byNetwork("base-sepolia")
   * .byPool("123")
   * .forDateRange("2024-01-01", "2024-01-31")
   * .execute();
   * ```
   */
  forDateRange(startDate: string, endDate: string): this {
    this.where({ date_gte: startDate, date_lte: endDate });
    return this;
  }

  /**
   * Filter by minimum new members.
   *
   * @param minNewMembers - Minimum number of new members.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const growthDays = await client.query().dailyPoolStats()
   * .byNetwork("base-sepolia")
   * .withMinNewMembers(5)
   * .execute();
   * ```
   */
  withMinNewMembers(minNewMembers: number): this {
    this.where({ newMembers_gte: minNewMembers.toString() });
    return this;
  }

  /**
   * Filter by maximum new members.
   *
   * @param maxNewMembers - Maximum number of new members.
   * @returns The current query builder instance for chaining.
   */
  withMaxNewMembers(maxNewMembers: number): this {
    this.where({ newMembers_lte: maxNewMembers.toString() });
    return this;
  }

  /**
   * Filter by minimum user operations.
   *
   * @param minUserOperations - Minimum number of user operations.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const activeDays = await client.query().dailyPoolStats()
   * .byNetwork("base-sepolia")
   * .withMinUserOperations(10)
   * .execute();
   * ```
   */
  withMinUserOperations(minUserOperations: number): this {
    this.where({ userOperations_gte: minUserOperations.toString() });
    return this;
  }

  /**
   * Filter by maximum user operations.
   *
   * @param maxUserOperations - Maximum number of user operations.
   * @returns The current query builder instance for chaining.
   */
  withMaxUserOperations(maxUserOperations: number): this {
    this.where({ userOperations_lte: maxUserOperations.toString() });
    return this;
  }

  /**
   * Filter by minimum gas spent.
   *
   * @param minGasSpent - Minimum gas spent in wei (as string).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const highGasDays = await client.query().dailyPoolStats()
   * .byNetwork("base-sepolia")
   * .withMinGasSpent("1000000000000000000") // 1 ETH
   * .execute();
   * ```
   */
  withMinGasSpent(minGasSpent: string): this {
    this.where({ gasSpent_gte: minGasSpent });
    return this;
  }

  /**
   * Filter by maximum gas spent.
   *
   * @param maxGasSpent - Maximum gas spent in wei (as string).
   * @returns The current query builder instance for chaining.
   */
  withMaxGasSpent(maxGasSpent: string): this {
    this.where({ gasSpent_lte: maxGasSpent });
    return this;
  }

  /**
   * Filter by minimum revenue generated.
   *
   * @param minRevenue - Minimum revenue in wei (as string).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const profitableDays = await client.query().dailyPoolStats()
   * .byNetwork("base-sepolia")
   * .withMinRevenue("100000000000000000") // 0.1 ETH
   * .execute();
   * ```
   */
  withMinRevenue(minRevenue: string): this {
    this.where({ revenueGenerated_gte: minRevenue });
    return this;
  }

  /**
   * Filter by maximum revenue generated.
   *
   * @param maxRevenue - Maximum revenue in wei (as string).
   * @returns The current query builder instance for chaining.
   */
  withMaxRevenue(maxRevenue: string): this {
    this.where({ revenueGenerated_lte: maxRevenue });
    return this;
  }

  /**
   * Filter by minimum total members.
   *
   * @param minTotalMembers - Minimum total members.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const popularPoolDays = await client.query().dailyPoolStats()
   * .byNetwork("base-sepolia")
   * .withMinTotalMembers(50)
   * .execute();
   * ```
   */
  withMinTotalMembers(minTotalMembers: number): this {
    this.where({ totalMembers_gte: minTotalMembers.toString() });
    return this;
  }

  /**
   * Filter by maximum total members.
   *
   * @param maxTotalMembers - Maximum total members.
   * @returns The current query builder instance for chaining.
   */
  withMaxTotalMembers(maxTotalMembers: number): this {
    this.where({ totalMembers_lte: maxTotalMembers.toString() });
    return this;
  }

  /**
   * Filter by minimum total deposits.
   *
   * @param minTotalDeposits - Minimum total deposits in wei (as string).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const wellFundedDays = await client.query().dailyPoolStats()
   * .byNetwork("base-sepolia")
   * .withMinTotalDeposits("10000000000000000000") // 10 ETH
   * .execute();
   * ```
   */
  withMinTotalDeposits(minTotalDeposits: string): this {
    this.where({ totalDeposits_gte: minTotalDeposits });
    return this;
  }

  /**
   * Filter by maximum total deposits.
   *
   * @param maxTotalDeposits - Maximum total deposits in wei (as string).
   * @returns The current query builder instance for chaining.
   */
  withMaxTotalDeposits(maxTotalDeposits: string): this {
    this.where({ totalDeposits_lte: maxTotalDeposits });
    return this;
  }

  /**
   * ========================================
   * ORDERING METHODS
   * ========================================
   */

  /**
   * Order by date.
   *
   * @param direction - Sort direction, "desc" for newest first (default), "asc" for oldest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const recentStats = await client.query().dailyPoolStats()
   * .byNetwork("base-sepolia")
   * .byPool("123")
   * .orderByDate()
   * .limit(30)
   * .execute();
   * ```
   */
  orderByDate(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("date", direction);
    return this;
  }

  /**
   * Order by new members.
   *
   * @param direction - Sort direction, "desc" for highest growth first (default), "asc" for lowest.
   * @returns The current query builder instance for chaining.
   */
  orderByNewMembers(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("newMembers", direction);
    return this;
  }

  /**
   * Order by user operations.
   *
   * @param direction - Sort direction, "desc" for most active first (default), "asc" for least active.
   * @returns The current query builder instance for chaining.
   */
  orderByUserOperations(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("userOperations", direction);
    return this;
  }

  /**
   * Order by gas spent.
   *
   * @param direction - Sort direction, "desc" for highest first (default), "asc" for lowest.
   * @returns The current query builder instance for chaining.
   */
  orderByGasSpent(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("gasSpent", direction);
    return this;
  }

  /**
   * Order by revenue generated.
   *
   * @param direction - Sort direction, "desc" for most profitable first (default), "asc" for least profitable.
   * @returns The current query builder instance for chaining.
   */
  orderByRevenue(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("revenueGenerated", direction);
    return this;
  }

  /**
   * Order by total members.
   *
   * @param direction - Sort direction, "desc" for largest pool first (default), "asc" for smallest.
   * @returns The current query builder instance for chaining.
   */
  orderByTotalMembers(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalMembers", direction);
    return this;
  }

  /**
   * Order by total deposits.
   *
   * @param direction - Sort direction, "desc" for highest deposits first (default), "asc" for lowest.
   * @returns The current query builder instance for chaining.
   */
  orderByTotalDeposits(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalDeposits", direction);
    return this;
  }

  /**
   * ========================================
   * CONVENIENCE ORDERING METHODS
   * ========================================
   */

  /**
   * Order by newest first. Alias for `orderByDate("desc")`.
   *
   * @returns The current query builder instance for chaining.
   */
  orderByNewest(): this {
    return this.orderByDate("desc");
  }

  /**
   * Order by oldest first. Alias for `orderByDate("asc")`.
   *
   * @returns The current query builder instance for chaining.
   */
  orderByOldest(): this {
    return this.orderByDate("asc");
  }

  /**
   * Order by most active (based on user operations). Alias for `orderByUserOperations("desc")`.
   *
   * @returns The current query builder instance for chaining.
   */
  orderByMostActive(): this {
    return this.orderByUserOperations("desc");
  }

  /**
   * Order by highest growth (based on new members). Alias for `orderByNewMembers("desc")`.
   *
   * @returns The current query builder instance for chaining.
   */
  orderByHighestGrowth(): this {
    return this.orderByNewMembers("desc");
  }

  /**
   * Order by most profitable (based on revenue generated). Alias for `orderByRevenue("desc")`.
   *
   * @returns The current query builder instance for chaining.
   */
  orderByMostProfitable(): this {
    return this.orderByRevenue("desc");
  }

  /**
   * ========================================
   * ANALYTICS METHODS
   * ========================================
   */

  /**
   * Get aggregated statistics for a pool based on the current query configuration.
   *
   * @returns Promise resolving to aggregated pool statistics.
   */
  async getPoolPerformanceStats(): Promise<{
    totalDays: number;
    totalNewMembers: string;
    totalUserOperations: string;
    totalGasSpent: string;
    totalRevenue: string;
    averageNewMembers: number;
    averageUserOperations: number;
    averageGasSpent: string;
    averageRevenue: string;
    peakDay: {
      date: string;
      newMembers: string;
      userOperations: string;
      gasSpent: string;
      revenue: string;
    };
    growthRate: {
      members: number;
      operations: number;
      revenue: number;
    };
  }> {
    const stats = await this.execute();

    const totalDays = stats.length;
    const totalNewMembers = stats.reduce(
      (sum, day) => sum + BigInt(day.newMembers),
      0n,
    );
    const totalUserOperations = stats.reduce(
      (sum, day) => sum + BigInt(day.userOperations),
      0n,
    );
    const totalGasSpent = stats.reduce(
      (sum, day) => sum + BigInt(day.gasSpent),
      0n,
    );
    const totalRevenue = stats.reduce(
      (sum, day) => sum + BigInt(day.revenueGenerated),
      0n,
    );

    const averageNewMembers =
      totalDays > 0 ? Number(totalNewMembers) / totalDays : 0;
    const averageUserOperations =
      totalDays > 0 ? Number(totalUserOperations) / totalDays : 0;
    const averageGasSpent =
      totalDays > 0 ? (totalGasSpent / BigInt(totalDays)).toString() : "0";
    const averageRevenue =
      totalDays > 0 ? (totalRevenue / BigInt(totalDays)).toString() : "0";

    // Find peak day (based on user operations for this example)
    const peakDay = stats.reduce(
      (peak, day) =>
        BigInt(day.userOperations) > BigInt(peak.userOperations) ? day : peak,
      stats[0] || {
        date: "",
        newMembers: "0",
        userOperations: "0",
        gasSpent: "0",
        revenueGenerated: "0",
        totalMembers: "0", // Add missing fields for initial peakDay object
        totalDeposits: "0",
        id: "",
        network: "mainnet", // Placeholder
        createdAtBlock: "0",
        createdAtTimestamp: "0",
      },
    );

    // Calculate growth rates (simple linear approximation)
    // For more robust growth rate, consider exponential or logarithmic fits.
    const firstDay = stats[0];
    const lastDay = stats[stats.length - 1];

    let memberGrowthRate = 0;
    if (firstDay && lastDay && totalDays > 1) {
      memberGrowthRate =
        (Number(lastDay.totalMembers) - Number(firstDay.totalMembers)) /
        totalDays;
    }

    let operationGrowthRate = 0;
    if (totalDays > 1) {
      operationGrowthRate = Number(totalUserOperations) / totalDays;
    }

    let revenueGrowthRate = 0;
    if (totalDays > 1) {
      revenueGrowthRate = Number(totalRevenue) / totalDays;
    }

    return {
      totalDays,
      totalNewMembers: totalNewMembers.toString(),
      totalUserOperations: totalUserOperations.toString(),
      totalGasSpent: totalGasSpent.toString(),
      totalRevenue: totalRevenue.toString(),
      averageNewMembers: Math.round(averageNewMembers * 100) / 100,
      averageUserOperations: Math.round(averageUserOperations * 100) / 100,
      averageGasSpent,
      averageRevenue,
      peakDay: {
        date: peakDay.date,
        newMembers: peakDay.newMembers.toString(),
        userOperations: peakDay.userOperations.toString(),
        gasSpent: peakDay.gasSpent.toString(),
        revenue: peakDay.revenueGenerated.toString(),
      },
      growthRate: {
        members: Math.round(memberGrowthRate * 100) / 100,
        operations: Math.round(operationGrowthRate * 100) / 100,
        revenue: Math.round(revenueGrowthRate * 100) / 100,
      },
    };
  }

  /**
   * Get pool utilization metrics based on the current query configuration.
   *
   * @returns Promise resolving to pool utilization data.
   */
  async getPoolUtilizationMetrics(): Promise<{
    utilizationRate: number;
    efficiencyScore: number;
    memberRetentionRate: number;
    averageDepositUtilization: number;
    trends: Array<{
      date: string;
      utilization: number;
      efficiency: number;
      memberActivity: number;
    }>;
  }> {
    const stats = await this.orderByDate("asc").execute();

    if (stats.length === 0) {
      return {
        utilizationRate: 0,
        efficiencyScore: 0,
        memberRetentionRate: 0,
        averageDepositUtilization: 0,
        trends: [],
      };
    }

    let totalUtilization = 0;
    let totalEfficiency = 0;
    let totalMemberActivity = 0;
    const trends = [];

    for (const stat of stats) {
      const utilization =
        Number(stat.totalMembers) > 0
          ? (Number(stat.userOperations) / Number(stat.totalMembers)) * 100
          : 0;
      const efficiency =
        Number(stat.gasSpent) > 0
          ? (Number(stat.revenueGenerated) / Number(stat.gasSpent)) * 100
          : 0;
      const memberActivity =
        Number(stat.totalMembers) > 0
          ? (Number(stat.newMembers) / Number(stat.totalMembers)) * 100
          : 0;

      totalUtilization += utilization;
      totalEfficiency += efficiency;
      totalMemberActivity += memberActivity;

      trends.push({
        date: stat.date,
        utilization: Math.round(utilization * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100,
        memberActivity: Math.round(memberActivity * 100) / 100,
      });
    }

    const statCount = stats.length;
    const utilizationRate = statCount > 0 ? totalUtilization / statCount : 0;
    const efficiencyScore = statCount > 0 ? totalEfficiency / statCount : 0;
    const memberRetentionRate =
      statCount > 0 ? totalMemberActivity / statCount : 0;

    // Calculate average deposit utilization
    const totalDeposits = stats.reduce(
      (sum, stat) => sum + BigInt(stat.totalDeposits),
      0n,
    );
    const totalGasSpent = stats.reduce(
      (sum, stat) => sum + BigInt(stat.gasSpent),
      0n,
    );
    const averageDepositUtilization =
      totalDeposits > 0n
        ? (Number(totalGasSpent) / Number(totalDeposits)) * 100
        : 0;

    return {
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      efficiencyScore: Math.round(efficiencyScore * 100) / 100,
      memberRetentionRate: Math.round(memberRetentionRate * 100) / 100,
      averageDepositUtilization:
        Math.round(averageDepositUtilization * 100) / 100,
      trends,
    };
  }
}

/**
 * ========================================
 * CONVENIENCE FUNCTIONS (Updated to use new DailyPoolStatsQueryBuilder)
 * ========================================
 */

/**
 * Get daily pool stats for a specific date range.
 *
 * @param client - The SubgraphClient instance.
 * @param poolId - The ID of the pool.
 * @param network - The network identifier.
 * @param startDate - The start date (YYYY-MM-DD).
 * @param endDate - The end date (YYYY-MM-DD).
 * @returns A promise resolving to an array of DailyPoolStats entities for the specified range.
 *
 * @example
 * ```typescript
 * const dailyStats = await getDailyPoolStatsForDateRange(client, "123", "base-sepolia", "2024-01-01", "2024-01-31");
 * console.log(dailyStats);
 * ```
 */
export async function getDailyPoolStatsForDateRange(
  client: SubgraphClient,
  poolId: string,
  network: NetworkName,
  startDate: string,
  endDate: string,
): Promise<DailyPoolStats[]> {
  return new DailyPoolStatsQueryBuilder(client)
    .byNetwork(network)
    .byPool(poolId)
    .forDateRange(startDate, endDate)
    .orderByDate("asc")
    .execute();
}

/**
 * Get recent daily pool statistics for a given pool.
 *
 * @param client - The SubgraphClient instance.
 * @param poolId - The ID of the pool.
 * @param network - The network identifier.
 * @param days - The number of most recent days to fetch (defaults to 30).
 * @returns A promise resolving to an array of recent DailyPoolStats entities.
 *
 * @example
 * ```typescript
 * const recentStats = await getRecentDailyPoolStats(client, "123", "base-sepolia", 7);
 * console.log(recentStats);
 * ```
 */
export async function getRecentDailyPoolStats(
  client: SubgraphClient,
  poolId: string,
  network: NetworkName,
  days: number = 30,
): Promise<DailyPoolStats[]> {
  return new DailyPoolStatsQueryBuilder(client)
    .byNetwork(network)
    .byPool(poolId)
    .orderByDate("desc")
    .limit(days)
    .execute();
}

/**
 * Get top-performing pools based on user activity.
 *
 * @param client - The SubgraphClient instance.
 * @param network - The network identifier.
 * @param limit - The maximum number of top pools to return (defaults to 10).
 * @returns A promise resolving to an array of DailyPoolStats for the top pools.
 *
 * @example
 * ```typescript
 * const topPools = await getTopPerformingPools(client, "base-sepolia", 5);
 * console.log(topPools);
 * ```
 */
export async function getTopPerformingPools(
  client: SubgraphClient,
  network: NetworkName,
  limit: number = 10,
): Promise<DailyPoolStats[]> {
  return new DailyPoolStatsQueryBuilder(client)
    .byNetwork(network)
    .orderByMostActive()
    .limit(limit)
    .execute();
}

/**
 * Perform a comprehensive performance analysis for a specific pool over a given period.
 *
 * @param client - The SubgraphClient instance.
 * @param poolId - The ID of the pool.
 * @param network - The network identifier.
 * @param days - The number of past days to include in the analysis (defaults to 30).
 * @returns A promise resolving to an object containing various performance metrics.
 *
 * @example
 * ```typescript
 * const performanceAnalysis = await getPoolPerformanceAnalysis(client, "123", "base-sepolia", 60);
 * console.log(performanceAnalysis);
 * ```
 */
export async function getPoolPerformanceAnalysis(
  client: SubgraphClient,
  poolId: string,
  network: NetworkName,
  days: number = 30,
): Promise<{
  totalDays: number;
  totalNewMembers: string;
  totalUserOperations: string;
  totalGasSpent: string;
  totalRevenue: string;
  averageNewMembers: number;
  averageUserOperations: number;
  averageGasSpent: string;
  averageRevenue: string;
  peakDay: {
    date: string;
    newMembers: string;
    userOperations: string;
    gasSpent: string;
    revenue: string;
  };
  growthRate: {
    members: number;
    operations: number;
    revenue: number;
  };
}> {
  return new DailyPoolStatsQueryBuilder(client)
    .byNetwork(network)
    .byPool(poolId)
    .orderByDate("asc")
    .limit(days)
    .getPoolPerformanceStats();
}
