import { BaseQueryBuilder } from "./base-query-builder.js";
import { PoolFields, PoolWhereInput } from "../types.js";
import { Pool, PoolMember, SubgraphResponse } from "../../types/subgraph.js";
import type { SubgraphClient } from "../../client/subgraph-client.js";
import { serializePool, SerializedPool } from "../../transformers/index.js";

/**
 * Query builder for Pool entities with pool-specific convenience methods
 *
 * Extends BaseQueryBuilder to provide Pool-specific functionality including
 * specialized filtering methods and integration with SubgraphClient.
 */
export class PoolQueryBuilder extends BaseQueryBuilder<
  Pool,
  PoolFields,
  PoolWhereInput
> {
  constructor(private client: SubgraphClient) {
    super();
  }

  /**
   * Filter by specific pool ID
   *
   * @param poolId - The pool ID to filter by
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const pool = await query.pools().byId("1").first();
   * ```
   */
  byId(poolId: string): this {
    return this.where({ poolId: { eq: poolId } });
  }

  /**
   * Filter pools by joining fee range
   *
   * @param min - Minimum joining fee (in wei as string)
   * @param max - Maximum joining fee (in wei as string)
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * // Pools with joining fee between 0.1 and 1 ETH
   * const affordablePools = await query.pools()
   *   .joiningFeeBetween("100000000000000000", "1000000000000000000")
   *   .execute();
   * ```
   */
  joiningFeeBetween(min: string, max: string): this {
    return this.where({
      joiningFee: { gte: min, lte: max },
    });
  }

  /**
   * Filter pools with joining fee less than or equal to specified amount
   *
   * @param maxFee - Maximum joining fee (in wei as string)
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * // Pools with joining fee <= 0.5 ETH
   * const cheapPools = await query.pools()
   *   .maxJoiningFee("500000000000000000")
   *   .execute();
   * ```
   */
  maxJoiningFee(maxFee: string): this {
    return this.where({ joiningFee: { lte: maxFee } });
  }

  /**
   * Filter pools with minimum number of members
   *
   * @param count - Minimum member count
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * // Pools with at least 10 members
   * const activePools = await query.pools()
   *   .withMinMembers(10)
   *   .execute();
   * ```
   */
  withMinMembers(count: number): this {
    return this.where({ membersCount: { gte: count.toString() } });
  }

  /**
   * Filter pools with maximum number of members
   *
   * @param count - Maximum member count
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * // Pools with at most 50 members
   * const smallPools = await query.pools()
   *   .withMaxMembers(50)
   *   .execute();
   * ```
   */
  withMaxMembers(count: number): this {
    return this.where({ membersCount: { lte: count.toString() } });
  }

  /**
   * Filter pools by member count range
   *
   * @param min - Minimum member count
   * @param max - Maximum member count
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * // Pools with 10-100 members
   * const mediumPools = await query.pools()
   *   .memberCountBetween(10, 100)
   *   .execute();
   * ```
   */
  memberCountBetween(min: number, max: number): this {
    return this.where({
      membersCount: { gte: min.toString(), lte: max.toString() },
    });
  }

  /**
   * Order pools by specific field and direction
   *
   * @param field - Field to order by
   * @param direction - Order direction ("asc" or "desc")
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const newestPools = await query.pools()
   *   .orderBy("createdAt", "desc")
   *   .execute();
   * ```
   */
  orderBy(field: string, direction: "asc" | "desc" = "asc"): this {
    this.config.orderBy = field;
    this.config.orderDirection = direction;
    return this;
  }

  /**
   * Order pools by creation date (newest first)
   *
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const newestPools = await query.pools()
   *   .orderByNewest()
   *   .limit(10)
   *   .execute();
   * ```
   */
  orderByNewest(): this {
    return this.orderBy("createdAt", "desc");
  }

  /**
   * Order pools by creation date (oldest first)
   *
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const oldestPools = await query.pools()
   *   .orderByOldest()
   *   .limit(10)
   *   .execute();
   * ```
   */
  orderByOldest(): this {
    return this.orderBy("createdAt", "asc");
  }

  /**
   * Order pools by popularity (most members first)
   *
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const popularPools = await query.pools()
   *   .orderByPopularity()
   *   .limit(10)
   *   .execute();
   * ```
   */
  orderByPopularity(): this {
    return this.orderBy("membersCount", "desc");
  }

  /**
   * Order pools by affordability (lowest joining fee first)
   *
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const affordablePools = await query.pools()
   *   .orderByAffordability()
   *   .limit(10)
   *   .execute();
   * ```
   */
  orderByAffordability(): this {
    return this.orderBy("joiningFee", "asc");
  }

  /**
   * Execute the query and return pool results
   *
   * @returns Promise resolving to array of Pool entities
   *
   * @example
   * ```typescript
   * const pools = await query.pools()
   *   .withMinMembers(5)
   *   .orderByNewest()
   *   .limit(20)
   *   .execute();
   * ```
   */
  async execute(): Promise<Pool[]> {
    const config = this.getConfig();

    if (this.selectedFields) {
      // Use field selection if specified
      const response = await this.client.getPoolsWithFields(
        this.selectedFields,
        config,
      );
      return response.data as Pool[];
    } else {
      // Use default fields
      const response = await this.client.getAllPools(config);
      return response.data;
    }
  }

  /**
   * Execute the query and return serialized pool results
   *
   * @returns Promise resolving to array of SerializedPool entities
   *
   * @example
   * ```typescript
   * const serializedPools = await query.pools()
   *   .withMinMembers(5)
   *   .orderByNewest()
   *   .limit(20)
   *   .executeAndSerialize();
   * ```
   */
  async executeAndSerialize(): Promise<SerializedPool[]> {
    const pools = await this.execute();
    return pools.map(serializePool);
  }

  /**
   * Get pool with members included
   * Returns a new builder that will fetch pool data with member information
   *
   * @param memberLimit - Maximum number of members to fetch per pool (default: 100)
   * @returns PoolQueryWithMembersBuilder for extended functionality
   *
   * @example
   * ```typescript
   * const poolsWithMembers = await query.pools()
   *   .byId("1")
   *   .withMembers(50)
   *   .execute();
   * ```
   */
  withMembers(memberLimit: number = 100): PoolQueryWithMembersBuilder {
    return new PoolQueryWithMembersBuilder(
      this.client,
      this.getConfig(),
      memberLimit,
    );
  }

  /**
   * Clone the current query builder
   *
   * @returns New PoolQueryBuilder instance with same configuration
   */
  clone(): PoolQueryBuilder {
    const cloned = new PoolQueryBuilder(this.client);
    cloned.config = { ...this.config };
    cloned.selectedFields = this.selectedFields
      ? [...this.selectedFields]
      : undefined;
    return cloned;
  }
}

/**
 * Extended query builder for pools that includes member data
 *
 * This builder extends the base functionality to fetch pools along with their
 * member information, useful for detailed pool analysis.
 */
export class PoolQueryWithMembersBuilder extends BaseQueryBuilder<
  Pool & { members: PoolMember[] },
  PoolFields,
  PoolWhereInput
> {
  constructor(
    private client: SubgraphClient,
    private baseConfig: any,
    private memberLimit: number,
  ) {
    super();
    this.config = { ...baseConfig };
  }

  /**
   * Execute query and return pools with their members
   *
   * @returns Promise resolving to pools with member data included
   */
  async execute(): Promise<(Pool & { members: PoolMember[] })[]> {
    // First, get the pools based on current configuration
    const poolsResponse = await this.client.getAllPools(this.config);
    const pools = poolsResponse.data;

    // For each pool, fetch its members
    const poolsWithMembers = await Promise.all(
      pools.map(async (pool) => {
        const membersResponse = await this.client.getPoolMembers(pool.id, {
          first: this.memberLimit,
        });
        return {
          ...pool,
          members: membersResponse.data,
        };
      }),
    );

    return poolsWithMembers;
  }

  /**
   * Execute query and return serialized pools with members
   *
   * @returns Promise resolving to array of SerializedPool entities with members
   *
   * @example
   * ```typescript
   * const serializedPoolsWithMembers = await query.pools()
   *   .byId("1")
   *   .withMembers(50)
   *   .executeAndSerialize();
   * ```
   */
  async executeAndSerialize(): Promise<SerializedPool[]> {
    const poolsWithMembers = await this.execute();
    // Serialize each pool (serializePool handles the members array automatically)
    return poolsWithMembers.map(serializePool);
  }

  /**
   * Count pools (members are not counted, only pools)
   *
   * @returns Promise resolving to number of matching pools
   */
  async count(): Promise<number> {
    const poolsResponse = await this.client.getAllPools(this.config);
    return poolsResponse.data.length;
  }

  /**
   * Clone the current query builder
   *
   * @returns New PoolQueryWithMembersBuilder instance with same configuration
   */
  clone(): PoolQueryWithMembersBuilder {
    const cloned = new PoolQueryWithMembersBuilder(
      this.client,
      this.baseConfig,
      this.memberLimit,
    );
    cloned.config = { ...this.config };
    cloned.selectedFields = this.selectedFields
      ? [...this.selectedFields]
      : undefined;
    return cloned;
  }
}
