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
 * Default fields to fetch when no specific fields are selected
 * Matches the GET_POOL_MEMBERS query from queries.ts
 */
const DEFAULT_MEMBER_FIELDS: PoolMemberFields[] = [
  "id",
  "identityCommitment",
  "memberIndex",
  "joinedAt",
  "joinedAtBlock",
  "isActive",
];

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
    return this.where({ pool: poolId });
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
    return this.where({ identityCommitment });
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
    return this.where({ identityCommitment_in: identityCommitments });
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
    return this.where({ isActive: true });
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
    return this.where({ isActive: false });
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
      memberIndex_gte: min,
      memberIndex_lte: max,
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
    return this.where({ joinedAt_gt: timestamp });
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
    return this.where({ joinedAt_lt: timestamp });
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
   * Build GraphQL query string for pool members
   *
   * @private
   * @param fields - Fields to include in the query
   * @returns GraphQL query string
   */
  private buildMembersQuery(fields: PoolMemberFields[]): string {
    const fieldsList = fields.map((field) => `      ${field}`).join("\n");
    return `
      query GetPoolMembers(
        $first: Int!
        $skip: Int!
        $orderBy: PoolMember_orderBy
        $orderDirection: OrderDirection
        $where: PoolMember_filter
      ) {
        poolMembers(
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

    // Only include variables that have values to avoid GraphQL errors
    const variables: Record<string, any> = {
      first: config.first || 100,
      skip: config.skip || 0,
    };

    // Only add orderBy if specified
    if (config.orderBy) {
      variables.orderBy = config.orderBy;
    }

    // Only add orderDirection if specified
    if (config.orderDirection) {
      variables.orderDirection = config.orderDirection;
    }

    // Only add where if there are conditions
    if (config.where && Object.keys(config.where).length > 0) {
      variables.where = config.where;
    }

    return variables;
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
    // Use selected fields or default fields
    const fields = this.selectedFields || DEFAULT_MEMBER_FIELDS;

    // Build query and variables
    const query = this.buildMembersQuery(fields);
    const variables = this.buildQueryVariables();

    // Execute via generic SubgraphClient method
    const response = await this.client.executeQuery<{
      poolMembers: PoolMember[];
    }>(query, variables);
    return response.poolMembers;
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
    const members = await this.execute();
    return members.length;
  }

  /**
   * Find all pool memberships for a specific identity (convenience method)
   *
   * Internally uses query builder methods for consistency.
   * This replaces the old SubgraphClient.getPoolsByIdentity() method.
   *
   * @param identityCommitment - The identity commitment to search for
   * @param options - Pagination options
   * @returns Promise resolving to array of member-pool pairs
   *
   * @example
   * ```typescript
   * const memberships = await client.query().members().findPoolsByIdentity('0x123...');
   * memberships.forEach(({ member, pool }) => {
   *   console.log(`Member in pool ${pool.poolId}`);
   * });
   * ```
   */
  async findPoolsByIdentity(
    identityCommitment: string,
    options: { first?: number; skip?: number } = {},
  ): Promise<Array<{ member: PoolMember; pool: Pool }>> {
    const { first = 100, skip = 0 } = options;

    // Use existing MemberQueryBuilder methods internally
    // Apply filtering, ordering, and pagination before withPool()
    const membersWithPools = await this.byIdentity(identityCommitment)
      .orderByNewestJoined() // Apply ordering first
      .limit(first)
      .skip(skip)
      .withPool() // Then add pool data
      .execute();

    // Transform from PoolMember & { pool: Pool } to { member: PoolMember; pool: Pool }
    return membersWithPools.map((memberWithPool) => {
      const { pool, ...memberData } = memberWithPool;
      return {
        member: memberData as PoolMember,
        pool: pool,
      };
    });
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
   * Build GraphQL query string for members with pool data
   *
   * @private
   * @param fields - Member fields to include in the query
   * @returns GraphQL query string
   */
  private buildMembersWithPoolQuery(fields: PoolMemberFields[]): string {
    const memberFieldsList = fields.map((field) => `      ${field}`).join("\n");
    return `
      query GetPoolMembersWithPool(
        $first: Int!
        $skip: Int!
        $orderBy: PoolMember_orderBy
        $orderDirection: OrderDirection
        $where: PoolMember_filter
      ) {
        poolMembers(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: $orderDirection
          where: $where
        ) {
${memberFieldsList}
          pool {
            id
            poolId
            joiningFee
            merkleTreeDuration
            totalDeposits
            currentMerkleTreeRoot
            membersCount
            merkleTreeDepth
            createdAt
            createdAtBlock
            currentRootIndex
            rootHistoryCount
          }
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

    // Only include variables that have values to avoid GraphQL errors
    const variables: Record<string, any> = {
      first: config.first || 100,
      skip: config.skip || 0,
    };

    // Only add orderBy if specified
    if (config.orderBy) {
      variables.orderBy = config.orderBy;
    }

    // Only add orderDirection if specified
    if (config.orderDirection) {
      variables.orderDirection = config.orderDirection;
    }

    // Only add where if there are conditions
    if (config.where && Object.keys(config.where).length > 0) {
      variables.where = config.where;
    }

    return variables;
  }

  /**
   * Execute query and return members with their pool data
   *
   * @returns Promise resolving to members with pool data included
   */
  async execute(): Promise<(PoolMember & { pool: Pool })[]> {
    // Use selected fields or default fields for members
    const memberFields = this.selectedFields || DEFAULT_MEMBER_FIELDS;

    // Build query and variables
    const query = this.buildMembersWithPoolQuery(memberFields);
    const variables = this.buildQueryVariables();

    // Execute via generic SubgraphClient method
    const response = await this.client.executeQuery<{
      poolMembers: (PoolMember & { pool: Pool })[];
    }>(query, variables);

    return response.poolMembers;
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
    const members = await this.execute();
    return members.length;
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
