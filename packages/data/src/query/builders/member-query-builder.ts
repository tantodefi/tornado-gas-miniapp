import { BaseQueryBuilder } from "./base-query-builder.js";
import { PoolMemberFields, PoolMemberWhereInput } from "../types.js";
import { PoolMember, Pool, SubgraphResponse } from "../../types/subgraph.js";
import type { SubgraphClient } from "../../client/subgraph-client.js";
import {
  serializePoolMember,
  serializePool,
  SerializedPoolMember,
  SerializedPool,
} from "../../transformers/index.js";

/**
 * Query builder for PoolMember entities with member-specific convenience methods
 *
 * Extends BaseQueryBuilder to provide PoolMember-specific functionality including
 * specialized filtering methods for member queries and pool association.
 */
export class PoolMemberQueryBuilder extends BaseQueryBuilder<
  PoolMember,
  PoolMemberFields,
  PoolMemberWhereInput
> {
  private poolId?: string;

  constructor(private client: SubgraphClient) {
    super();
  }

  /**
   * Filter members by specific pool ID
   *
   * @param poolId - The pool ID to filter members by
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const poolMembers = await query.members()
   *   .inPool("1")
   *   .execute();
   * ```
   */
  inPool(poolId: string): this {
    this.poolId = poolId;
    return this;
  }

  /**
   * Filter by specific identity commitment
   *
   * @param identityCommitment - The identity commitment to filter by
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const userMemberships = await query.members()
   *   .byIdentity("0x123...")
   *   .execute();
   * ```
   */
  byIdentity(identityCommitment: string): this {
    return this.where({ identityCommitment: { eq: identityCommitment } });
  }

  /**
   * Filter by multiple identity commitments
   *
   * @param identityCommitments - Array of identity commitments to filter by
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const teamMemberships = await query.members()
   *   .byIdentities(["0x123...", "0x456...", "0x789..."])
   *   .execute();
   * ```
   */
  byIdentities(identityCommitments: string[]): this {
    return this.where({ identityCommitment: { in: identityCommitments } });
  }

  /**
   * Filter only active members
   *
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const activeMembers = await query.members()
   *   .inPool("1")
   *   .activeOnly()
   *   .execute();
   * ```
   */
  activeOnly(): this {
    return this.where({ isActive: { eq: true } });
  }

  /**
   * Filter only inactive members
   *
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const inactiveMembers = await query.members()
   *   .inPool("1")
   *   .inactiveOnly()
   *   .execute();
   * ```
   */
  inactiveOnly(): this {
    return this.where({ isActive: { eq: false } });
  }

  /**
   * Filter members by member index range
   *
   * @param min - Minimum member index
   * @param max - Maximum member index
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const earlyMembers = await query.members()
   *   .inPool("1")
   *   .memberIndexBetween("0", "99")
   *   .execute();
   * ```
   */
  memberIndexBetween(min: string, max: string): this {
    return this.where({
      memberIndex: { gte: min, lte: max },
    });
  }

  /**
   * Filter members who joined after specific timestamp
   *
   * @param timestamp - Minimum join timestamp
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const recentMembers = await query.members()
   *   .inPool("1")
   *   .joinedAfter("1640995200")
   *   .execute();
   * ```
   */
  joinedAfter(timestamp: string): this {
    return this.where({ joinedAt: { gt: timestamp } });
  }

  /**
   * Filter members who joined before specific timestamp
   *
   * @param timestamp - Maximum join timestamp
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const oldMembers = await query.members()
   *   .inPool("1")
   *   .joinedBefore("1640995200")
   *   .execute();
   * ```
   */
  joinedBefore(timestamp: string): this {
    return this.where({ joinedAt: { lt: timestamp } });
  }

  /**
   * Order members by specific field and direction
   *
   * @param field - Field to order by
   * @param direction - Order direction ("asc" or "desc")
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const membersByIndex = await query.members()
   *   .inPool("1")
   *   .orderBy("memberIndex", "asc")
   *   .execute();
   * ```
   */
  orderBy(field: string, direction: "asc" | "desc" = "asc"): this {
    this.config.orderBy = field;
    this.config.orderDirection = direction;
    return this;
  }

  /**
   * Order members by join date (newest first)
   *
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const newestMembers = await query.members()
   *   .inPool("1")
   *   .orderByNewestJoined()
   *   .limit(10)
   *   .execute();
   * ```
   */
  orderByNewestJoined(): this {
    return this.orderBy("joinedAt", "desc");
  }

  /**
   * Order members by join date (oldest first)
   *
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const oldestMembers = await query.members()
   *   .inPool("1")
   *   .orderByOldestJoined()
   *   .limit(10)
   *   .execute();
   * ```
   */
  orderByOldestJoined(): this {
    return this.orderBy("joinedAt", "asc");
  }

  /**
   * Order members by member index (lowest first)
   *
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * const membersByIndex = await query.members()
   *   .inPool("1")
   *   .orderByMemberIndex()
   *   .execute();
   * ```
   */
  orderByMemberIndex(): this {
    return this.orderBy("memberIndex", "asc");
  }

  /**
   * Execute the query and return member results
   *
   * @returns Promise resolving to array of PoolMember entities
   *
   * @example
   * ```typescript
   * const members = await query.members()
   *   .inPool("1")
   *   .activeOnly()
   *   .orderByNewestJoined()
   *   .limit(50)
   *   .execute();
   * ```
   */
  async execute(): Promise<PoolMember[]> {
    if (!this.poolId) {
      throw new Error(
        "Pool ID is required for member queries. Use .inPool(poolId) first.",
      );
    }

    const config = this.getConfig();
    const response = await this.client.getPoolMembers(this.poolId, config);
    return response.data;
  }

  /**
   * Execute the query and return serialized member results
   *
   * @returns Promise resolving to array of SerializedPoolMember entities
   *
   * @example
   * ```typescript
   * const serializedMembers = await query.members()
   *   .inPool("1")
   *   .activeOnly()
   *   .orderByNewestJoined()
   *   .limit(50)
   *   .executeAndSerialize();
   * ```
   */
  async executeAndSerialize(): Promise<SerializedPoolMember[]> {
    const members = await this.execute();
    return members.map(serializePoolMember);
  }

  /**
   * Get member with pool data included
   * Returns a new builder that will fetch member data with pool information
   *
   * @returns MemberQueryWithPoolBuilder for extended functionality
   *
   * @example
   * ```typescript
   * const membersWithPools = await query.members()
   *   .inPool("1")
   *   .withPool()
   *   .execute();
   * ```
   */
  withPool(): MemberQueryWithPoolBuilder {
    return new MemberQueryWithPoolBuilder(
      this.client,
      this.getConfig(),
      this.poolId,
    );
  }

  /**
   * Count members in the specified pool
   * Requires poolId to be set first
   *
   * @returns Promise resolving to number of matching members
   *
   * @example
   * ```typescript
   * const activeCount = await query.members()
   *   .inPool("1")
   *   .activeOnly()
   *   .count();
   * ```
   */
  async count(): Promise<number> {
    if (!this.poolId) {
      throw new Error(
        "Pool ID is required for member queries. Use .inPool(poolId) first.",
      );
    }

    // Use base implementation which removes pagination and counts results
    return await super.count();
  }

  /**
   * Clone the current query builder
   *
   * @returns New PoolMemberQueryBuilder instance with same configuration
   */
  clone(): PoolMemberQueryBuilder {
    const cloned = new PoolMemberQueryBuilder(this.client);
    cloned.config = { ...this.config };
    cloned.selectedFields = this.selectedFields
      ? [...this.selectedFields]
      : undefined;
    cloned.poolId = this.poolId;
    return cloned;
  }
}

/**
 * Extended query builder for members that includes pool data
 *
 * This builder extends the base functionality to fetch members along with their
 * associated pool information, useful for cross-pool member analysis.
 */
export class MemberQueryWithPoolBuilder extends BaseQueryBuilder<
  PoolMember & { pool: Pool },
  PoolMemberFields,
  PoolMemberWhereInput
> {
  constructor(
    private client: SubgraphClient,
    private baseConfig: any,
    private poolId?: string,
  ) {
    super();
    this.config = { ...baseConfig };
  }

  /**
   * Execute query and return members with their pool data
   *
   * @returns Promise resolving to members with pool data included
   */
  async execute(): Promise<(PoolMember & { pool: Pool })[]> {
    if (!this.poolId) {
      throw new Error(
        "Pool ID is required for member queries. Use .inPool(poolId) first.",
      );
    }

    // Get members
    const membersResponse = await this.client.getPoolMembers(
      this.poolId,
      this.config,
    );
    const members = membersResponse.data;

    // Get pool details
    const poolResponse = await this.client.getPoolDetails(this.poolId);
    const pool = poolResponse.data;

    if (!pool) {
      throw new Error(`Pool with ID ${this.poolId} not found`);
    }

    // Combine member and pool data
    return members.map((member) => ({
      ...member,
      pool: pool,
    }));
  }

  /**
   * Execute query and return serialized members with pool data
   *
   * @returns Promise resolving to array of SerializedPoolMember entities with pool data
   *
   * @example
   * ```typescript
   * const serializedMembersWithPool = await query.members()
   *   .inPool("1")
   *   .activeOnly()
   *   .withPool()
   *   .executeAndSerialize();
   * ```
   */
  async executeAndSerialize(): Promise<
    (SerializedPoolMember & { pool: SerializedPool })[]
  > {
    const membersWithPool = await this.execute();

    // Serialize each member and their associated pool
    return membersWithPool.map((memberWithPool) => ({
      ...serializePoolMember(memberWithPool),
      pool: serializePool(memberWithPool.pool),
    }));
  }

  /**
   * Count members (pool data is not counted, only members)
   *
   * @returns Promise resolving to number of matching members
   */
  async count(): Promise<number> {
    if (!this.poolId) {
      throw new Error(
        "Pool ID is required for member queries. Use .inPool(poolId) first.",
      );
    }

    const membersResponse = await this.client.getPoolMembers(
      this.poolId,
      this.config,
    );
    return membersResponse.data.length;
  }

  /**
   * Clone the current query builder
   *
   * @returns New MemberQueryWithPoolBuilder instance with same configuration
   */
  clone(): MemberQueryWithPoolBuilder {
    const cloned = new MemberQueryWithPoolBuilder(
      this.client,
      this.baseConfig,
      this.poolId,
    );
    cloned.config = { ...this.config };
    cloned.selectedFields = this.selectedFields
      ? [...this.selectedFields]
      : undefined;
    return cloned;
  }
}
