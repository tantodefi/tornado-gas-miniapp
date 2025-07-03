import { BaseQueryBuilder } from "./base-query-builder.js";
import {
  DailyPoolStatsFields,
  DailyGlobalStatsFields,
  DailyPoolStatsWhereInput,
  DailyGlobalStatsWhereInput,
  DateRangeFilter,
} from "../types.js";
import {
  DailyPoolStats,
  DailyGlobalStats,
  Pool,
} from "../../types/subgraph.js";
import type { SubgraphClient } from "../../client/subgraph-client.js";
import {
  serializeDailyPoolStats,
  serializeDailyGlobalStats,
  SerializedDailyPoolStats,
  SerializedDailyGlobalStats,
} from "../../transformers/index.js";

/**
 * Default fields for DailyPoolStats
 */
const DEFAULT_DAILY_POOL_STATS_FIELDS: DailyPoolStatsFields[] = [
  "id",
  "date",
  "newMembers",
  "userOperations",
  "gasSpent",
  "revenueGenerated",
  "totalMembers",
  "totalDeposits",
];

/**
 * Default fields for DailyGlobalStats
 */
const DEFAULT_DAILY_GLOBAL_STATS_FIELDS: DailyGlobalStatsFields[] = [
  "id",
  "date",
  "newPools",
  "totalNewMembers",
  "totalUserOperations",
  "totalGasSpent",
  "totalRevenueGenerated",
  "totalActivePools",
  "totalMembers",
];

/**
 * Query builder for DailyPoolStats entities
 *
 * Provides methods to query and analyze daily pool statistics
 */
export class DailyPoolStatsQueryBuilder extends BaseQueryBuilder<
  DailyPoolStats,
  DailyPoolStatsFields,
  DailyPoolStatsWhereInput
> {
  constructor(private client: SubgraphClient) {
    super();
  }

  /**
   * Filter by specific pool ID
   *
   * @param poolId - The pool ID to filter by
   * @returns this for method chaining
   */
  forPool(poolId: string): this {
    return this.where({ pool: poolId });
  }

  /**
   * Filter by multiple pool IDs
   *
   * @param poolIds - Array of pool IDs to filter by
   * @returns this for method chaining
   */
  forPools(poolIds: string[]): this {
    return this.where({ pool_in: poolIds });
  }

  /**
   * Filter by specific date
   *
   * @param date - Date in YYYY-MM-DD format
   * @returns this for method chaining
   */
  forDate(date: string): this {
    return this.where({ date });
  }

  /**
   * Filter by date range
   *
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns this for method chaining
   */
  forDateRange(startDate: string, endDate: string): this {
    return this.where({
      date_gte: startDate,
      date_lte: endDate,
    });
  }

  /**
   * Filter by date range object
   *
   * @param dateRange - Date range object
   * @returns this for method chaining
   */
  forDateRangeObject(dateRange: DateRangeFilter): this {
    return this.forDateRange(dateRange.startDate, dateRange.endDate);
  }

  /**
   * Filter by minimum new members
   *
   * @param minNewMembers - Minimum new members count
   * @returns this for method chaining
   */
  withMinNewMembers(minNewMembers: number): this {
    return this.where({ newMembers_gte: minNewMembers.toString() });
  }

  /**
   * Filter by minimum user operations
   *
   * @param minUserOps - Minimum user operations count
   * @returns this for method chaining
   */
  withMinUserOperations(minUserOps: number): this {
    return this.where({ userOperations_gte: minUserOps.toString() });
  }

  /**
   * Filter by minimum gas spent
   *
   * @param minGasSpent - Minimum gas spent (in wei as string)
   * @returns this for method chaining
   */
  withMinGasSpent(minGasSpent: string): this {
    return this.where({ gasSpent_gte: minGasSpent });
  }

  /**
   * Filter by minimum revenue generated
   *
   * @param minRevenue - Minimum revenue generated (in wei as string)
   * @returns this for method chaining
   */
  withMinRevenue(minRevenue: string): this {
    return this.where({ revenueGenerated_gte: minRevenue });
  }

  /**
   * Filter by gas spent range
   *
   * @param minGasSpent - Minimum gas spent (in wei as string)
   * @param maxGasSpent - Maximum gas spent (in wei as string)
   * @returns this for method chaining
   */
  gasSpentBetween(minGasSpent: string, maxGasSpent: string): this {
    return this.where({
      gasSpent_gte: minGasSpent,
      gasSpent_lte: maxGasSpent,
    });
  }

  /**
   * Filter by revenue range
   *
   * @param minRevenue - Minimum revenue (in wei as string)
   * @param maxRevenue - Maximum revenue (in wei as string)
   * @returns this for method chaining
   */
  revenueBetween(minRevenue: string, maxRevenue: string): this {
    return this.where({
      revenueGenerated_gte: minRevenue,
      revenueGenerated_lte: maxRevenue,
    });
  }

  /**
   * Order by specific field and direction
   *
   * @param field - Field to order by
   * @param direction - Order direction ("asc" or "desc")
   * @returns this for method chaining
   */
  orderBy(field: string, direction: "asc" | "desc" = "asc"): this {
    this.config.orderBy = field;
    this.config.orderDirection = direction;
    return this;
  }

  /**
   * Order by date (newest first)
   *
   * @returns this for method chaining
   */
  orderByNewest(): this {
    return this.orderBy("date", "desc");
  }

  /**
   * Order by date (oldest first)
   *
   * @returns this for method chaining
   */
  orderByOldest(): this {
    return this.orderBy("date", "asc");
  }

  /**
   * Order by gas spent (highest first)
   *
   * @returns this for method chaining
   */
  orderByGasSpent(): this {
    return this.orderBy("gasSpent", "desc");
  }

  /**
   * Order by revenue generated (highest first)
   *
   * @returns this for method chaining
   */
  orderByRevenue(): this {
    return this.orderBy("revenueGenerated", "desc");
  }

  /**
   * Order by new members (highest first)
   *
   * @returns this for method chaining
   */
  orderByNewMembers(): this {
    return this.orderBy("newMembers", "desc");
  }

  /**
   * Order by user operations (highest first)
   *
   * @returns this for method chaining
   */
  orderByUserOperations(): this {
    return this.orderBy("userOperations", "desc");
  }

  /**
   * Build GraphQL query string for daily pool stats
   *
   * @private
   * @param fields - Fields to include in the query
   * @returns GraphQL query string
   */
  private buildDailyPoolStatsQuery(fields: DailyPoolStatsFields[]): string {
    const fieldsList = fields.map((field) => `      ${field}`).join("\n");
    return `
      query GetDailyPoolStats(
        $first: Int!
        $skip: Int!
        $orderBy: DailyPoolStats_orderBy
        $orderDirection: OrderDirection
        $where: DailyPoolStats_filter
      ) {
        dailyPoolStats(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: $orderDirection
          where: $where
        ) {
${fieldsList}
        }
      }
    `;
  }

  /**
   * Build query variables from current configuration
   *
   * @private
   * @returns Query variables object
   */
  private buildQueryVariables(): Record<string, any> {
    const config = this.getConfig();

    const variables: Record<string, any> = {
      first: config.first || 100,
      skip: config.skip || 0,
    };

    if (config.orderBy) {
      variables.orderBy = config.orderBy;
    }

    if (config.orderDirection) {
      variables.orderDirection = config.orderDirection;
    }

    if (config.where && Object.keys(config.where).length > 0) {
      variables.where = config.where;
    }

    return variables;
  }

  /**
   * Execute the query and return daily pool stats results
   *
   * @returns Promise resolving to array of DailyPoolStats entities
   */
  async execute(): Promise<DailyPoolStats[]> {
    const fields = this.selectedFields || DEFAULT_DAILY_POOL_STATS_FIELDS;
    const query = this.buildDailyPoolStatsQuery(fields);
    const variables = this.buildQueryVariables();

    const response = await this.client.executeQuery<{
      dailyPoolStats: DailyPoolStats[];
    }>(query, variables);
    return response.dailyPoolStats;
  }

  /**
   * Execute the query and return serialized daily pool stats results
   *
   * @returns Promise resolving to array of SerializedDailyPoolStats entities
   */
  async executeAndSerialize(): Promise<SerializedDailyPoolStats[]> {
    const stats = await this.execute();
    return stats.map(serializeDailyPoolStats);
  }

  /**
   * Get daily pool stats with pool data included
   *
   * @returns DailyPoolStatsQueryWithPoolBuilder for extended functionality
   */
  withPool(): DailyPoolStatsQueryWithPoolBuilder {
    return new DailyPoolStatsQueryWithPoolBuilder(
      this.client,
      this.getConfig(),
    );
  }

  /**
   * Get time series data for a specific pool
   *
   * @param poolId - Pool ID to get time series for
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Promise resolving to array of daily stats
   */
  async getTimeSeriesForPool(
    poolId: string,
    startDate: string,
    endDate: string,
  ): Promise<DailyPoolStats[]> {
    return await this.forPool(poolId)
      .forDateRange(startDate, endDate)
      .orderByOldest()
      .execute();
  }

  /**
   * Clone the current query builder
   *
   * @returns New DailyPoolStatsQueryBuilder instance with same configuration
   */
  clone(): DailyPoolStatsQueryBuilder {
    const cloned = new DailyPoolStatsQueryBuilder(this.client);
    cloned.config = { ...this.config };
    cloned.selectedFields = this.selectedFields
      ? [...this.selectedFields]
      : undefined;
    return cloned;
  }
}

/**
 * Extended query builder for daily pool stats that includes pool data
 */
export class DailyPoolStatsQueryWithPoolBuilder extends BaseQueryBuilder<
  DailyPoolStats & { pool: Pool },
  DailyPoolStatsFields,
  DailyPoolStatsWhereInput
> {
  constructor(
    private client: SubgraphClient,
    private baseConfig: any,
  ) {
    super();
    this.config = { ...baseConfig };
  }

  /**
   * Execute query and return daily pool stats with pool data
   *
   * @returns Promise resolving to daily pool stats with pool data included
   */
  async execute(): Promise<(DailyPoolStats & { pool: Pool })[]> {
    const fields = this.selectedFields || DEFAULT_DAILY_POOL_STATS_FIELDS;
    const fieldsList = fields.map((field) => `      ${field}`).join("\n");

    const query = `
      query GetDailyPoolStatsWithPool(
        $first: Int!
        $skip: Int!
        $orderBy: DailyPoolStats_orderBy
        $orderDirection: OrderDirection
        $where: DailyPoolStats_filter
      ) {
        dailyPoolStats(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: $orderDirection
          where: $where
        ) {
${fieldsList}
          pool {
            id
            poolId
            joiningFee
            totalDeposits
            memberCount
            currentMerkleRoot
            createdAtTimestamp
            paymaster {
              id
              contractType
              address
            }
          }
        }
      }
    `;

    const config = this.getConfig();
    const variables: Record<string, any> = {
      first: config.first || 100,
      skip: config.skip || 0,
    };

    if (config.orderBy) {
      variables.orderBy = config.orderBy;
    }

    if (config.orderDirection) {
      variables.orderDirection = config.orderDirection;
    }

    if (config.where && Object.keys(config.where).length > 0) {
      variables.where = config.where;
    }

    const response = await this.client.executeQuery<{
      dailyPoolStats: (DailyPoolStats & { pool: Pool })[];
    }>(query, variables);

    return response.dailyPoolStats;
  }

  /**
   * Execute query and return serialized daily pool stats with pool data
   *
   * @returns Promise resolving to array of SerializedDailyPoolStats entities with pool data
   */
  async executeAndSerialize(): Promise<SerializedDailyPoolStats[]> {
    const statsWithPool = await this.execute();
    return statsWithPool.map(serializeDailyPoolStats);
  }

  /**
   * Clone the current query builder
   *
   * @returns New DailyPoolStatsQueryWithPoolBuilder instance with same configuration
   */
  clone(): DailyPoolStatsQueryWithPoolBuilder {
    const cloned = new DailyPoolStatsQueryWithPoolBuilder(
      this.client,
      this.baseConfig,
    );
    cloned.config = { ...this.config };
    cloned.selectedFields = this.selectedFields
      ? [...this.selectedFields]
      : undefined;
    return cloned;
  }
}

/**
 * Query builder for DailyGlobalStats entities
 *
 * Provides methods to query and analyze daily global statistics
 */
export class DailyGlobalStatsQueryBuilder extends BaseQueryBuilder<
  DailyGlobalStats,
  DailyGlobalStatsFields,
  DailyGlobalStatsWhereInput
> {
  constructor(private client: SubgraphClient) {
    super();
  }

  /**
   * Filter by specific date
   *
   * @param date - Date in YYYY-MM-DD format
   * @returns this for method chaining
   */
  forDate(date: string): this {
    return this.where({ date });
  }

  /**
   * Filter by date range
   *
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns this for method chaining
   */
  forDateRange(startDate: string, endDate: string): this {
    return this.where({
      date_gte: startDate,
      date_lte: endDate,
    });
  }

  /**
   * Filter by date range object
   *
   * @param dateRange - Date range object
   * @returns this for method chaining
   */
  forDateRangeObject(dateRange: DateRangeFilter): this {
    return this.forDateRange(dateRange.startDate, dateRange.endDate);
  }

  /**
   * Filter by minimum new pools
   *
   * @param minNewPools - Minimum new pools count
   * @returns this for method chaining
   */
  withMinNewPools(minNewPools: number): this {
    return this.where({ newPools_gte: minNewPools.toString() });
  }

  /**
   * Filter by minimum total new members
   *
   * @param minNewMembers - Minimum new members count
   * @returns this for method chaining
   */
  withMinNewMembers(minNewMembers: number): this {
    return this.where({ totalNewMembers_gte: minNewMembers.toString() });
  }

  /**
   * Filter by minimum total user operations
   *
   * @param minUserOps - Minimum user operations count
   * @returns this for method chaining
   */
  withMinUserOperations(minUserOps: number): this {
    return this.where({ totalUserOperations_gte: minUserOps.toString() });
  }

  /**
   * Filter by minimum total gas spent
   *
   * @param minGasSpent - Minimum gas spent (in wei as string)
   * @returns this for method chaining
   */
  withMinGasSpent(minGasSpent: string): this {
    return this.where({ totalGasSpent_gte: minGasSpent });
  }

  /**
   * Filter by minimum total revenue generated
   *
   * @param minRevenue - Minimum revenue generated (in wei as string)
   * @returns this for method chaining
   */
  withMinRevenue(minRevenue: string): this {
    return this.where({ totalRevenueGenerated_gte: minRevenue });
  }

  /**
   * Filter by total gas spent range
   *
   * @param minGasSpent - Minimum gas spent (in wei as string)
   * @param maxGasSpent - Maximum gas spent (in wei as string)
   * @returns this for method chaining
   */
  gasSpentBetween(minGasSpent: string, maxGasSpent: string): this {
    return this.where({
      totalGasSpent_gte: minGasSpent,
      totalGasSpent_lte: maxGasSpent,
    });
  }

  /**
   * Filter by total revenue range
   *
   * @param minRevenue - Minimum revenue (in wei as string)
   * @param maxRevenue - Maximum revenue (in wei as string)
   * @returns this for method chaining
   */
  revenueBetween(minRevenue: string, maxRevenue: string): this {
    return this.where({
      totalRevenueGenerated_gte: minRevenue,
      totalRevenueGenerated_lte: maxRevenue,
    });
  }

  /**
   * Order by specific field and direction
   *
   * @param field - Field to order by
   * @param direction - Order direction ("asc" or "desc")
   * @returns this for method chaining
   */
  orderBy(field: string, direction: "asc" | "desc" = "asc"): this {
    this.config.orderBy = field;
    this.config.orderDirection = direction;
    return this;
  }

  /**
   * Order by date (newest first)
   *
   * @returns this for method chaining
   */
  orderByNewest(): this {
    return this.orderBy("date", "desc");
  }

  /**
   * Order by date (oldest first)
   *
   * @returns this for method chaining
   */
  orderByOldest(): this {
    return this.orderBy("date", "asc");
  }

  /**
   * Order by total gas spent (highest first)
   *
   * @returns this for method chaining
   */
  orderByGasSpent(): this {
    return this.orderBy("totalGasSpent", "desc");
  }

  /**
   * Order by total revenue generated (highest first)
   *
   * @returns this for method chaining
   */
  orderByRevenue(): this {
    return this.orderBy("totalRevenueGenerated", "desc");
  }

  /**
   * Order by total new members (highest first)
   *
   * @returns this for method chaining
   */
  orderByNewMembers(): this {
    return this.orderBy("totalNewMembers", "desc");
  }

  /**
   * Order by total user operations (highest first)
   *
   * @returns this for method chaining
   */
  orderByUserOperations(): this {
    return this.orderBy("totalUserOperations", "desc");
  }

  /**
   * Build GraphQL query string for daily global stats
   *
   * @private
   * @param fields - Fields to include in the query
   * @returns GraphQL query string
   */
  private buildDailyGlobalStatsQuery(fields: DailyGlobalStatsFields[]): string {
    const fieldsList = fields.map((field) => `      ${field}`).join("\n");
    return `
      query GetDailyGlobalStats(
        $first: Int!
        $skip: Int!
        $orderBy: DailyGlobalStats_orderBy
        $orderDirection: OrderDirection
        $where: DailyGlobalStats_filter
      ) {
        dailyGlobalStats(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: $orderDirection
          where: $where
        ) {
${fieldsList}
        }
      }
    `;
  }

  /**
   * Build query variables from current configuration
   *
   * @private
   * @returns Query variables object
   */
  private buildQueryVariables(): Record<string, any> {
    const config = this.getConfig();

    const variables: Record<string, any> = {
      first: config.first || 100,
      skip: config.skip || 0,
    };

    if (config.orderBy) {
      variables.orderBy = config.orderBy;
    }

    if (config.orderDirection) {
      variables.orderDirection = config.orderDirection;
    }

    if (config.where && Object.keys(config.where).length > 0) {
      variables.where = config.where;
    }

    return variables;
  }

  /**
   * Execute the query and return daily global stats results
   *
   * @returns Promise resolving to array of DailyGlobalStats entities
   */
  async execute(): Promise<DailyGlobalStats[]> {
    const fields = this.selectedFields || DEFAULT_DAILY_GLOBAL_STATS_FIELDS;
    const query = this.buildDailyGlobalStatsQuery(fields);
    const variables = this.buildQueryVariables();

    const response = await this.client.executeQuery<{
      dailyGlobalStats: DailyGlobalStats[];
    }>(query, variables);
    return response.dailyGlobalStats;
  }

  /**
   * Execute the query and return serialized daily global stats results
   *
   * @returns Promise resolving to array of SerializedDailyGlobalStats entities
   */
  async executeAndSerialize(): Promise<SerializedDailyGlobalStats[]> {
    const stats = await this.execute();
    return stats.map(serializeDailyGlobalStats);
  }

  /**
   * Get global time series data
   *
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Promise resolving to array of daily global stats
   */
  async getTimeSeries(
    startDate: string,
    endDate: string,
  ): Promise<DailyGlobalStats[]> {
    return await this.forDateRange(startDate, endDate)
      .orderByOldest()
      .execute();
  }

  /**
   * Get latest global stats
   *
   * @returns Promise resolving to latest global stats or null
   */
  async getLatest(): Promise<DailyGlobalStats | null> {
    return await this.orderByNewest().first();
  }

  /**
   * Clone the current query builder
   *
   * @returns New DailyGlobalStatsQueryBuilder instance with same configuration
   */
  clone(): DailyGlobalStatsQueryBuilder {
    const cloned = new DailyGlobalStatsQueryBuilder(this.client);
    cloned.config = { ...this.config };
    cloned.selectedFields = this.selectedFields
      ? [...this.selectedFields]
      : undefined;
    return cloned;
  }
}
