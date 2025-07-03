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
 * Updated to match new subgraph schema
 */
const DEFAULT_MEMBER_FIELDS: PoolMemberFields[] = [
  "id",
  "memberIndex",
  "identityCommitment",
  "merkleRootWhenAdded",
  "rootIndexWhenAdded",
  "addedAtBlock",
  "addedAtTransaction",
  "addedAtTimestamp",
];

/**
 * Query builder for PoolMember entities with member-specific convenience methods
 *
 * Updated for new PaymasterContract-based subgraph structure
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
   */
  inPool(poolId: string): this {
    this.poolId = poolId;
    return this.where({ pool: poolId });
  }

  /**
   * Filter members by multiple pool IDs
   *
   * @param poolIds - Array of pool IDs to filter members by
   * @returns this for method chaining
   */
  inPools(poolIds: string[]): this {
    return this.where({ pool_in: poolIds });
  }

  /**
   * Filter by specific identity commitment
   *
   * @param identityCommitment - The identity commitment to filter by
   * @returns this for method chaining
   */
  byIdentity(identityCommitment: string): this {
    return this.where({ identityCommitment });
  }

  /**
   * Filter by multiple identity commitments
   *
   * @param identityCommitments - Array of identity commitments to filter by
   * @returns this for method chaining
   */
  byIdentities(identityCommitments: string[]): this {
    return this.where({ identityCommitment_in: identityCommitments });
  }

  /**
   * Filter by identity commitment pattern
   *
   * @param pattern - Pattern to match in identity commitment
   * @returns this for method chaining
   */
  identityContains(pattern: string): this {
    return this.where({ identityCommitment_contains: pattern });
  }

  /**
   * Filter members by member index range
   *
   * @param min - Minimum member index
   * @param max - Maximum member index
   * @returns this for method chaining
   */
  memberIndexBetween(min: string, max: string): this {
    return this.where({
      memberIndex_gte: min,
      memberIndex_lte: max,
    });
  }

  /**
   * Filter members with minimum member index
   *
   * @param minIndex - Minimum member index
   * @returns this for method chaining
   */
  memberIndexFrom(minIndex: string): this {
    return this.where({ memberIndex_gte: minIndex });
  }

  /**
   * Filter members with maximum member index
   *
   * @param maxIndex - Maximum member index
   * @returns this for method chaining
   */
  memberIndexTo(maxIndex: string): this {
    return this.where({ memberIndex_lte: maxIndex });
  }

  /**
   * Filter members who added after specific timestamp
   *
   * @param timestamp - Minimum addition timestamp
   * @returns this for method chaining
   */
  addedAfter(timestamp: string): this {
    return this.where({ addedAtTimestamp_gt: timestamp });
  }

  /**
   * Filter members who added before specific timestamp
   *
   * @param timestamp - Maximum addition timestamp
   * @returns this for method chaining
   */
  addedBefore(timestamp: string): this {
    return this.where({ addedAtTimestamp_lt: timestamp });
  }

  /**
   * Filter members added in a specific time range
   *
   * @param startTimestamp - Start of time range
   * @param endTimestamp - End of time range
   * @returns this for method chaining
   */
  addedBetween(startTimestamp: string, endTimestamp: string): this {
    return this.where({
      addedAtTimestamp_gte: startTimestamp,
      addedAtTimestamp_lte: endTimestamp,
    });
  }

  /**
   * Filter members who added at or after specific block
   *
   * @param blockNumber - Minimum block number
   * @returns this for method chaining
   */
  addedAtBlock(blockNumber: string): this {
    return this.where({ addedAtBlock_gte: blockNumber });
  }

  /**
   * Filter members with gas usage (GasLimited paymaster)
   *
   * @param minGasUsed - Minimum gas used
   * @param maxGasUsed - Maximum gas used (optional)
   * @returns this for method chaining
   */
  withGasUsage(minGasUsed: string, maxGasUsed?: string): this {
    const conditions: Partial<PoolMemberWhereInput> = {
      gasUsed_gte: minGasUsed,
    };

    if (maxGasUsed) {
      conditions.gasUsed_lte = maxGasUsed;
    }

    return this.where(conditions);
  }

  /**
   * Filter members with nullifier usage (OneTimeUse paymaster)
   *
   * @param used - Whether nullifier was used
   * @returns this for method chaining
   */
  withNullifierUsed(used: boolean): this {
    return this.where({ nullifierUsed: used });
  }

  /**
   * Order members by specific field and direction
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
   * Order members by addition date (newest first)
   *
   * @returns this for method chaining
   */
  orderByNewestAdded(): this {
    return this.orderBy("addedAtTimestamp", "desc");
  }

  /**
   * Order members by addition date (oldest first)
   *
   * @returns this for method chaining
   */
  orderByOldestAdded(): this {
    return this.orderBy("addedAtTimestamp", "asc");
  }

  /**
   * Order members by member index (lowest first)
   *
   * @returns this for method chaining
   */
  orderByMemberIndex(): this {
    return this.orderBy("memberIndex", "asc");
  }

  /**
   * Order members by gas usage (highest first)
   *
   * @returns this for method chaining
   */
  orderByGasUsage(): this {
    return this.orderBy("gasUsed", "desc");
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
   * Execute the query and return member results
   *
   * @returns Promise resolving to array of PoolMember entities
   */
  async execute(): Promise<PoolMember[]> {
    const fields = this.selectedFields || DEFAULT_MEMBER_FIELDS;
    const query = this.buildMembersQuery(fields);
    const variables = this.buildQueryVariables();

    const response = await this.client.executeQuery<{
      poolMembers: PoolMember[];
    }>(query, variables);
    return response.poolMembers;
  }

  /**
   * Execute the query and return serialized member results
   *
   * @returns Promise resolving to array of SerializedPoolMember entities
   */
  async executeAndSerialize(): Promise<SerializedPoolMember[]> {
    const members = await this.execute();
    return members.map(serializePoolMember);
  }

  /**
   * Get member with pool data included
   *
   * @returns MemberQueryWithPoolBuilder for extended functionality
   */
  withPool(): MemberQueryWithPoolBuilder {
    return new MemberQueryWithPoolBuilder(
      this.client,
      this.getConfig(),
      this.poolId,
    );
  }

  /**
   * Find all pool memberships for a specific identity
   *
   * @param identityCommitment - The identity commitment to search for
   * @param options - Pagination options
   * @returns Promise resolving to array of member-pool pairs
   */
  async findPoolsByIdentity(
    identityCommitment: string,
    options: { first?: number; skip?: number } = {},
  ): Promise<Array<{ member: PoolMember; pool: Pool }>> {
    const { first = 100, skip = 0 } = options;

    const membersWithPools = await this.byIdentity(identityCommitment)
      .orderByNewestAdded()
      .limit(first)
      .skip(skip)
      .withPool()
      .execute();

    return membersWithPools.map((memberWithPool) => {
      const { pool, ...memberData } = memberWithPool;
      return {
        member: memberData as PoolMember,
        pool: pool,
      };
    });
  }

  /**
   * Get member count for specific pool
   *
   * @param poolId - Pool ID to count members for
   * @returns Promise resolving to member count
   */
  async getMemberCount(poolId: string): Promise<number> {
    const members = await this.inPool(poolId).execute();
    return members.length;
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
            totalDeposits
            memberCount
            currentMerkleRoot
            currentRootIndex
            rootHistoryCount
            createdAtBlock
            createdAtTransaction
            createdAtTimestamp
            lastUpdatedBlock
            lastUpdatedTimestamp
            paymaster {
              id
              contractType
              address
            }
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
   * Execute query and return members with their pool data
   *
   * @returns Promise resolving to members with pool data included
   */
  async execute(): Promise<(PoolMember & { pool: Pool })[]> {
    const memberFields = this.selectedFields || DEFAULT_MEMBER_FIELDS;
    const query = this.buildMembersWithPoolQuery(memberFields);
    const variables = this.buildQueryVariables();

    const response = await this.client.executeQuery<{
      poolMembers: (PoolMember & { pool: Pool })[];
    }>(query, variables);

    return response.poolMembers;
  }

  /**
   * Execute query and return serialized members with pool data
   *
   * @returns Promise resolving to array of SerializedPoolMember entities with pool data
   */
  async executeAndSerialize(): Promise<
    (SerializedPoolMember & { pool: SerializedPool })[]
  > {
    const membersWithPool = await this.execute();

    return membersWithPool.map((memberWithPool) => ({
      ...serializePoolMember(memberWithPool),
      pool: serializePool(memberWithPool.pool),
    }));
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
