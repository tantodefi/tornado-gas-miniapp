// daily-global-stats-query-builder.ts (Refactored)

import type { SubgraphClient } from "../../client/subgraph-client.js";
import type {
  DailyGlobalStats,
  NetworkName,
  SerializedDailyGlobalStats,
} from "../../types/subgraph.js";
import { serializeDailyGlobalStats } from "../../transformers/index.js";
import {
  DailyGlobalStatsFields,
  DailyGlobalStatsWhereInput,
} from "../types.js";
import { BaseQueryBuilder } from "./base-query-builder.js";

export type DailyGlobalStatsOrderBy =
  | "date"
  | "newPools"
  | "totalNewMembers"
  | "totalUserOperations"
  | "totalGasSpent"
  | "totalRevenueGenerated"
  | "totalActivePools"
  | "totalMembers";

/**
 * Query builder for DailyGlobalStats entities
 *
 * Provides a fluent interface for building daily global statistics queries
 * with support for date ranges, network filtering, and metric analysis.
 */
export class DailyGlobalStatsQueryBuilder extends BaseQueryBuilder<
  DailyGlobalStats,
  SerializedDailyGlobalStats,
  DailyGlobalStatsFields,
  DailyGlobalStatsWhereInput,
  DailyGlobalStatsOrderBy
> {
  constructor(private subgraphClient: SubgraphClient) {
    // Default order by date descending.
    // Assuming the entity name in the subgraph schema is `dailyGlobalStats`
    super(subgraphClient, "dailyGlobalStats", "date", "desc");
  }

  protected buildDynamicQuery(): string {
    const fields =
      this.config.selectedFields?.join("\n        ") || this.getDefaultFields();
    const variables = this.getVariableDeclarations();
    const whereClause = this.buildWhereClauseString();
    const orderByClause = this.config.orderBy
      ? `orderBy: ${this.config.orderBy}`
      : "";
    const orderDirectionClause = this.config.orderDirection
      ? `orderDirection: ${this.config.orderDirection}`
      : "";

    const args = [
      whereClause,
      orderByClause,
      orderDirectionClause,
      "first: $first",
      "skip: $skip",
    ]
      .filter(Boolean)
      .join(", ");

    const queryName = `GetDailyGlobalStats`;

    return `
      query ${queryName}(${variables}) {
        dailyGlobalStats(${args}) {
          ${fields}
        }
      }
    `;
  }

  protected buildVariables(): Record<string, any> {
    const variables: Record<string, any> = {
      first: this.config.first || 100,
      skip: this.config.skip || 0,
    };

    if (this.config.where) {
      this.addWhereVariables(this.config.where, variables);
    }

    return variables;
  }

  protected buildWhereClauseString(): string {
    if (!this.config.where || Object.keys(this.config.where).length === 0) {
      return "";
    }

    const conditions = this.buildWhereConditions(this.config.where);
    return conditions.length > 0 ? `where: { ${conditions.join(", ")} }` : "";
  }

  protected getSerializer(): (
    entity: DailyGlobalStats,
  ) => SerializedDailyGlobalStats {
    return serializeDailyGlobalStats;
  }

  private getVariableDeclarations(): string {
    const declarations = ["$first: Int!", "$skip: Int!"];

    if (this.config.where) {
      this.addVariableDeclarations(this.config.where, declarations);
    }

    return declarations.join(", ");
  }

  private addVariableDeclarations(
    where: Partial<DailyGlobalStatsWhereInput>,
    declarations: string[],
  ): void {
    for (const [key, value] of Object.entries(where)) {
      switch (key) {
        case "id":
          declarations.push("$id: ID");
          break;
        case "network_in":
          declarations.push("$network_in: [String!]");
          break;
        case "date":
          declarations.push("$date: String");
          break;
        case "date_gte":
          declarations.push("$date_gte: String");
          break;
        case "date_lte":
          declarations.push("$date_lte: String");
          break;
        case "newPools_gte":
          declarations.push("$newPools_gte: String");
          break;
        case "newPools_lte":
          declarations.push("$newPools_lte: String");
          break;
        case "totalNewMembers_gte":
          declarations.push("$totalNewMembers_gte: String");
          break;
        case "totalNewMembers_lte":
          declarations.push("$totalNewMembers_lte: String");
          break;
        case "totalUserOperations_gte":
          declarations.push("$totalUserOperations_gte: String");
          break;
        case "totalUserOperations_lte":
          declarations.push("$totalUserOperations_lte: String");
          break;
        case "totalGasSpent_gte":
          declarations.push("$totalGasSpent_gte: String");
          break;
        case "totalGasSpent_lte":
          declarations.push("$totalGasSpent_lte: String");
          break;
        case "totalRevenueGenerated_gte":
          declarations.push("$totalRevenueGenerated_gte: String");
          break;
        case "totalRevenueGenerated_lte":
          declarations.push("$totalRevenueGenerated_lte: String");
          break;
        case "totalActivePools_gte":
          declarations.push("$totalActivePools_gte: String");
          break;
        case "totalActivePools_lte":
          declarations.push("$totalActivePools_lte: String");
          break;
        case "totalMembers_gte":
          declarations.push("$totalMembers_gte: String");
          break;
        case "totalMembers_lte":
          declarations.push("$totalMembers_lte: String");
          break;
      }
    }
  }

  private addWhereVariables(
    where: Partial<DailyGlobalStatsWhereInput>,
    variables: Record<string, any>,
  ): void {
    for (const [key, value] of Object.entries(where)) {
      switch (key) {
        case "id":
          variables.id = value;
          break;
        case "network_in":
          variables.network_in = value;
          break;
        case "date":
          variables.date = value;
          break;
        case "date_gte":
          variables.date_gte = value;
          break;
        case "date_lte":
          variables.date_lte = value;
          break;
        case "newPools_gte":
        case "newPools_lte":
        case "totalNewMembers_gte":
        case "totalNewMembers_lte":
        case "totalUserOperations_gte":
        case "totalUserOperations_lte":
        case "totalGasSpent_gte":
        case "totalGasSpent_lte":
        case "totalRevenueGenerated_gte":
        case "totalRevenueGenerated_lte":
        case "totalActivePools_gte":
        case "totalActivePools_lte":
        case "totalMembers_gte":
        case "totalMembers_lte":
          variables[key] = value;
          break;
      }
    }
  }

  private buildWhereConditions(
    where: Partial<DailyGlobalStatsWhereInput>,
  ): string[] {
    const conditions: string[] = [];

    for (const [key, value] of Object.entries(where)) {
      switch (key) {
        case "id":
          conditions.push("id: $id");
          break;
        case "network_in":
          conditions.push("network_in: $network_in");
          break;
        case "date":
          conditions.push("date: $date");
          break;
        case "date_gte":
          conditions.push("date_gte: $date_gte");
          break;
        case "date_lte":
          conditions.push("date_lte: $date_lte");
          break;
        case "newPools_gte":
          conditions.push("newPools_gte: $newPools_gte");
          break;
        case "newPools_lte":
          conditions.push("newPools_lte: $newPools_lte");
          break;
        case "totalNewMembers_gte":
          conditions.push("totalNewMembers_gte: $totalNewMembers_gte");
          break;
        case "totalNewMembers_lte":
          conditions.push("totalNewMembers_lte: $totalNewMembers_lte");
          break;
        case "totalUserOperations_gte":
          conditions.push("totalUserOperations_gte: $totalUserOperations_gte");
          break;
        case "totalUserOperations_lte":
          conditions.push("totalUserOperations_lte: $totalUserOperations_lte");
          break;
        case "totalGasSpent_gte":
          conditions.push("totalGasSpent_gte: $totalGasSpent_gte");
          break;
        case "totalGasSpent_lte":
          conditions.push("totalGasSpent_lte: $totalGasSpent_lte");
          break;
        case "totalRevenueGenerated_gte":
          conditions.push(
            "totalRevenueGenerated_gte: $totalRevenueGenerated_gte",
          );
          break;
        case "totalRevenueGenerated_lte":
          conditions.push(
            "totalRevenueGenerated_lte: $totalRevenueGenerated_lte",
          );
          break;
        case "totalActivePools_gte":
          conditions.push("totalActivePools_gte: $totalActivePools_gte");
          break;
        case "totalActivePools_lte":
          conditions.push("totalActivePools_lte: $totalActivePools_lte");
          break;
        case "totalMembers_gte":
          conditions.push("totalMembers_gte: $totalMembers_gte");
          break;
        case "totalMembers_lte":
          conditions.push("totalMembers_lte: $totalMembers_lte");
          break;
      }
    }

    return conditions;
  }

  /**
   * Override default fields for DailyGlobalStats entity.
   */
  protected getDefaultFields(): string {
    return `
      id
      date
      network
      newPools
      totalNewMembers
      totalUserOperations
      totalGasSpent
      totalRevenueGenerated
      totalActivePools
      totalMembers
    `;
  }

  /**
   * ========================================
   * FILTERING METHODS
   * ========================================
   */

  /**
   * Filter by a specific network.
   *
   * @param network - Network identifier (e.g., "base-sepolia").
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const globalStats = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .execute();
   * ```
   */
  byNetwork(network: NetworkName): this {
    // Assuming 'network' is a field in DailyGlobalStats that can be filtered
    // This might require a specific filter like network_in if 'network' is an enum or string field
    this.where({ network_in: [network] }); // Using network_in for exact match on a single network
    return this;
  }

  /**
   * Filter by a specific date.
   *
   * @param date - Date in YYYY-MM-DD format.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const dailyStats = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .forDate("2024-01-15")
   * .first();
   * ```
   */
  forDate(date: string): this {
    this.where({ date: date });
    return this;
  }

  /**
   * Filter by a date range.
   *
   * @param startDate - Start date in YYYY-MM-DD format.
   * @param endDate - End date in YYYY-MM-DD format.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const monthlyStats = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .forDateRange("2024-01-01", "2024-01-31")
   * .execute();
   * ```
   */
  forDateRange(startDate: string, endDate: string): this {
    this.where({ date_gte: startDate, date_lte: endDate });
    return this;
  }

  /**
   * Filter by minimum new pools.
   *
   * @param minNewPools - Minimum number of new pools.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const activeDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .withMinNewPools(2)
   * .execute();
   * ```
   */
  withMinNewPools(minNewPools: number): this {
    this.where({ newPools_gte: minNewPools.toString() });
    return this;
  }

  /**
   * Filter by maximum new pools.
   *
   * @param maxNewPools - Maximum number of new pools.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const calmDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .withMaxNewPools(5)
   * .execute();
   * ```
   */
  withMaxNewPools(maxNewPools: number): this {
    this.where({ newPools_lte: maxNewPools.toString() });
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
   * const growthDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .withMinNewMembers(10)
   * .execute();
   * ```
   */
  withMinNewMembers(minNewMembers: number): this {
    this.where({ totalNewMembers_gte: minNewMembers.toString() });
    return this;
  }

  /**
   * Filter by maximum new members.
   *
   * @param maxNewMembers - Maximum number of new members.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const stableDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .withMaxNewMembers(50)
   * .execute();
   * ```
   */
  withMaxNewMembers(maxNewMembers: number): this {
    this.where({ totalNewMembers_lte: maxNewMembers.toString() });
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
   * const busyDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .withMinUserOperations(100)
   * .execute();
   * ```
   */
  withMinUserOperations(minUserOperations: number): this {
    this.where({ totalUserOperations_gte: minUserOperations.toString() });
    return this;
  }

  /**
   * Filter by maximum user operations.
   *
   * @param maxUserOperations - Maximum number of user operations.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const quietDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .withMaxUserOperations(500)
   * .execute();
   * ```
   */
  withMaxUserOperations(maxUserOperations: number): this {
    this.where({ totalUserOperations_lte: maxUserOperations.toString() });
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
   * const highGasDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .withMinGasSpent("10000000000000000000") // 10 ETH
   * .execute();
   * ```
   */
  withMinGasSpent(minGasSpent: string): this {
    this.where({ totalGasSpent_gte: minGasSpent });
    return this;
  }

  /**
   * Filter by maximum gas spent.
   *
   * @param maxGasSpent - Maximum gas spent in wei (as string).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const lowGasDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .withMaxGasSpent("100000000000000000") // 0.1 ETH
   * .execute();
   * ```
   */
  withMaxGasSpent(maxGasSpent: string): this {
    this.where({ totalGasSpent_lte: maxGasSpent });
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
   * const profitableDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .withMinRevenue("1000000000000000000") // 1 ETH
   * .execute();
   * ```
   */
  withMinRevenue(minRevenue: string): this {
    this.where({ totalRevenueGenerated_gte: minRevenue });
    return this;
  }

  /**
   * Filter by maximum revenue generated.
   *
   * @param maxRevenue - Maximum revenue in wei (as string).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const lessProfitableDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .withMaxRevenue("500000000000000000") // 0.5 ETH
   * .execute();
   * ```
   */
  withMaxRevenue(maxRevenue: string): this {
    this.where({ totalRevenueGenerated_lte: maxRevenue });
    return this;
  }

  /**
   * Filter by minimum active pools.
   *
   * @param minActivePools - Minimum number of active pools.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const healthyDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .withMinActivePools(5)
   * .execute();
   * ```
   */
  withMinActivePools(minActivePools: number): this {
    this.where({ totalActivePools_gte: minActivePools.toString() });
    return this;
  }

  /**
   * Filter by maximum active pools.
   *
   * @param maxActivePools - Maximum number of active pools.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const fewerActivePoolsDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .withMaxActivePools(10)
   * .execute();
   * ```
   */
  withMaxActivePools(maxActivePools: number): this {
    this.where({ totalActivePools_lte: maxActivePools.toString() });
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
   * const scaleDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .withMinTotalMembers(1000)
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
   *
   * @example
   * ```typescript
   * const smallerScaleDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .withMaxTotalMembers(5000)
   * .execute();
   * ```
   */
  withMaxTotalMembers(maxTotalMembers: number): this {
    this.where({ totalMembers_lte: maxTotalMembers.toString() });
    return this;
  }

  /**
   * ========================================
   * ORDERING METHODS
   * ========================================
   */

  /**
   * Order results by date.
   *
   * @param direction - Sort direction, "desc" for newest first (default), "asc" for oldest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const recentStats = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
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
   * Order results by the number of new pools.
   *
   * @param direction - Sort direction, "desc" for most new pools first (default), "asc" for fewest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const daysWithMostNewPools = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .orderByNewPools("desc")
   * .execute();
   * ```
   */
  orderByNewPools(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("newPools", direction);
    return this;
  }

  /**
   * Order results by the number of new members.
   *
   * @param direction - Sort direction, "desc" for highest growth first (default), "asc" for lowest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const daysWithHighestMemberGrowth = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .orderByNewMembers("desc")
   * .execute();
   * ```
   */
  orderByNewMembers(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalNewMembers", direction);
    return this;
  }

  /**
   * Order results by the number of user operations.
   *
   * @param direction - Sort direction, "desc" for busiest days first (default), "asc" for quietest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const busiestDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .orderByUserOperations("desc")
   * .execute();
   * ```
   */
  orderByUserOperations(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalUserOperations", direction);
    return this;
  }

  /**
   * Order results by gas spent.
   *
   * @param direction - Sort direction, "desc" for highest gas spent first (default), "asc" for lowest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const daysWithHighestGasSpent = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .orderByGasSpent("desc")
   * .execute();
   * ```
   */
  orderByGasSpent(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalGasSpent", direction);
    return this;
  }

  /**
   * Order results by revenue generated.
   *
   * @param direction - Sort direction, "desc" for most profitable first (default), "asc" for least.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const mostProfitableDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .orderByRevenue("desc")
   * .execute();
   * ```
   */
  orderByRevenue(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalRevenueGenerated", direction);
    return this;
  }

  /**
   * Order results by the number of active pools.
   *
   * @param direction - Sort direction, "desc" for most active pools first (default), "asc" for fewest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const daysWithMostActivePools = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .orderByActivePools("desc")
   * .execute();
   * ```
   */
  orderByActivePools(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalActivePools", direction);
    return this;
  }

  /**
   * Order results by total members.
   *
   * @param direction - Sort direction, "desc" for largest total member count first (default), "asc" for smallest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const daysWithLargestMemberBase = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .orderByTotalMembers("desc")
   * .execute();
   * ```
   */
  orderByTotalMembers(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalMembers", direction);
    return this;
  }

  /**
   * ========================================
   * CONVENIENCE ORDERING METHODS
   * ========================================
   */

  /**
   * Order results by newest date first (descending).
   *
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const latestStats = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .orderByNewest()
   * .limit(7)
   * .execute();
   * ```
   */
  orderByNewest(): this {
    return this.orderByDate("desc");
  }

  /**
   * Order results by oldest date first (ascending).
   *
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const earliestStats = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .orderByOldest()
   * .limit(7)
   * .execute();
   * ```
   */
  orderByOldest(): this {
    return this.orderByDate("asc");
  }

  /**
   * Order results by the most user operations (busiest days first).
   *
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const topActivityDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .orderByMostActive()
   * .limit(5)
   * .execute();
   * ```
   */
  orderByMostActive(): this {
    return this.orderByUserOperations("desc");
  }

  /**
   * Order results by highest new member growth.
   *
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const topGrowthDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .orderByHighestGrowth()
   * .limit(5)
   * .execute();
   * ```
   */
  orderByHighestGrowth(): this {
    return this.orderByNewMembers("desc");
  }

  /**
   * Order results by most profitable days.
   *
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const topProfitableDays = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .orderByMostProfitable()
   * .limit(5)
   * .execute();
   * ```
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
   * Get aggregated statistics for the current query results.
   * This method fetches all data matching the current query builder's filters
   * and then calculates various totals, averages, and identifies the peak day.
   *
   * @returns A promise resolving to an object containing aggregated statistics.
   *
   * @example
   * ```typescript
   * const statsForMonth = await client.query().dailyGlobalStats()
   * .byNetwork("base-sepolia")
   * .forDateRange("2024-01-01", "2024-01-31")
   * .getAggregatedStats();
   * console.log(`Total user operations in January: ${statsForMonth.totalUserOperations}`);
   * ```
   */
  async getAggregatedStats(): Promise<{
    totalDays: number;
    totalNewPools: string;
    totalNewMembers: string;
    totalUserOperations: string;
    totalGasSpent: string;
    totalRevenue: string;
    averageNewPools: number;
    averageNewMembers: number;
    averageUserOperations: number;
    averageGasSpent: string;
    averageRevenue: string;
    peakDay: {
      date: string;
      userOperations: string;
      gasSpent: string;
      revenue: string;
    };
  }> {
    const stats = await this.execute();

    const totalDays = stats.length;
    const totalNewPools = stats.reduce(
      (sum, day) => sum + BigInt(day.newPools),
      0n,
    );
    const totalNewMembers = stats.reduce(
      (sum, day) => sum + BigInt(day.totalNewMembers),
      0n,
    );
    const totalUserOperations = stats.reduce(
      (sum, day) => sum + BigInt(day.totalUserOperations),
      0n,
    );
    const totalGasSpent = stats.reduce(
      (sum, day) => sum + BigInt(day.totalGasSpent),
      0n,
    );
    const totalRevenue = stats.reduce(
      (sum, day) => sum + BigInt(day.totalRevenueGenerated),
      0n,
    );

    const averageNewPools =
      totalDays > 0 ? Number(totalNewPools) / totalDays : 0;
    const averageNewMembers =
      totalDays > 0 ? Number(totalNewMembers) / totalDays : 0;
    const averageUserOperations =
      totalDays > 0 ? Number(totalUserOperations) / totalDays : 0;
    const averageGasSpent =
      totalDays > 0 ? (totalGasSpent / BigInt(totalDays)).toString() : "0";
    const averageRevenue =
      totalDays > 0 ? (totalRevenue / BigInt(totalDays)).toString() : "0";

    // Find peak day by user operations
    const peakDay = stats.reduce(
      (peak, day) =>
        BigInt(day.totalUserOperations) > BigInt(peak.totalUserOperations)
          ? day
          : peak,
      stats[0] || {
        date: "",
        totalUserOperations: "0",
        totalGasSpent: "0",
        totalRevenueGenerated: "0",
      }, // Provide a default structure for `stats[0]` if `stats` is empty
    );

    return {
      totalDays,
      totalNewPools: totalNewPools.toString(),
      totalNewMembers: totalNewMembers.toString(),
      totalUserOperations: totalUserOperations.toString(),
      totalGasSpent: totalGasSpent.toString(),
      totalRevenue: totalRevenue.toString(),
      averageNewPools: Math.round(averageNewPools * 100) / 100, // Round to 2 decimal places
      averageNewMembers: Math.round(averageNewMembers * 100) / 100,
      averageUserOperations: Math.round(averageUserOperations * 100) / 100,
      averageGasSpent,
      averageRevenue,
      peakDay: {
        date: peakDay.date,
        userOperations: peakDay.totalUserOperations.toString(),
        gasSpent: peakDay.totalGasSpent.toString(),
        revenue: peakDay.totalRevenueGenerated.toString(),
      },
    };
  }
}

/**
 * ========================================
 * CONVENIENCE FUNCTIONS (Updated to use new DailyGlobalStatsQueryBuilder)
 * ========================================
 */

/**
 * Get daily global statistics for a specific network within a given date range.
 *
 * @param client - The SubgraphClient instance.
 * @param network - The network identifier (e.g., "base-sepolia").
 * @param startDate - The start date in YYYY-MM-DD format.
 * @param endDate - The end date in YYYY-MM-DD format.
 * @returns A promise resolving to an array of DailyGlobalStats entities.
 *
 * @example
 * ```typescript
 * const stats = await getDailyGlobalStatsForDateRange(client, "base-sepolia", "2024-01-01", "2024-01-07");
 * stats.forEach(day => console.log(`${day.date}: User Ops: ${day.totalUserOperations}`));
 * ```
 */
export async function getDailyGlobalStatsForDateRange(
  client: SubgraphClient,
  network: NetworkName,
  startDate: string,
  endDate: string,
): Promise<DailyGlobalStats[]> {
  return new DailyGlobalStatsQueryBuilder(client)
    .byNetwork(network)
    .forDateRange(startDate, endDate)
    .orderByDate("asc") // Order by date ascending for chronological display
    .execute();
}

/**
 * Get the most recent daily global statistics for a specific network.
 *
 * @param client - The SubgraphClient instance.
 * @param network - The network identifier (e.g., "base-sepolia").
 * @param days - The number of recent days to fetch (defaults to 30).
 * @returns A promise resolving to an array of recent DailyGlobalStats entities.
 *
 * @example
 * ```typescript
 * const last7DaysStats = await getRecentDailyGlobalStats(client, "base-sepolia", 7);
 * last7DaysStats.forEach(day => console.log(`${day.date}: Revenue: ${day.totalRevenueGenerated}`));
 * ```
 */
export async function getRecentDailyGlobalStats(
  client: SubgraphClient,
  network: NetworkName,
  days: number = 30,
): Promise<DailyGlobalStats[]> {
  return new DailyGlobalStatsQueryBuilder(client)
    .byNetwork(network)
    .orderByNewest() // Uses orderByDate("desc")
    .limit(days)
    .execute();
}

/**
 * Get the days with the highest activity (based on user operations) for a specific network.
 *
 * @param client - The SubgraphClient instance.
 * @param network - The network identifier (e.g., "base-sepolia").
 * @param limit - The maximum number of peak activity days to return (defaults to 10).
 * @returns A promise resolving to an array of DailyGlobalStats entities representing peak activity days.
 *
 * @example
 * ```typescript
 * const top5Activity = await getPeakActivityDays(client, "base-sepolia", 5);
 * top5Activity.forEach(day => console.log(`${day.date}: Peak User Ops: ${day.totalUserOperations}`));
 * ```
 */
export async function getPeakActivityDays(
  client: SubgraphClient,
  network: NetworkName,
  limit: number = 10,
): Promise<DailyGlobalStats[]> {
  return new DailyGlobalStatsQueryBuilder(client)
    .byNetwork(network)
    .orderByMostActive() // Uses orderByUserOperations("desc")
    .limit(limit)
    .execute();
}
