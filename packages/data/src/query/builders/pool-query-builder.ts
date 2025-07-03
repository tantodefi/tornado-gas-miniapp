import { BaseQueryBuilder } from "./base-query-builder.js";
import { PoolFields, PoolWhereInput, RootHistoryItem } from "../types.js";
import { Pool, PoolMember, MerkleRoot } from "../../types/subgraph.js";
import type { SubgraphClient } from "../../client/subgraph-client.js";
import { serializePool, SerializedPool } from "../../transformers/index.js";

/**
 * Default fields to fetch when no specific fields are selected
 * Updated to match new subgraph schema
 */
const DEFAULT_POOL_FIELDS: PoolFields[] = [
  "id",
  "poolId",
  "joiningFee",
  "memberCount",
  "createdAtTimestamp",
];

/**
 * Query builder for Pool entities with pool-specific convenience methods
 *
 * Updated for new PaymasterContract-based subgraph structure
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
   */
  byId(poolId: string): this {
    return this.where({ poolId });
  }

  /**
   * Filter by paymaster contract address
   *
   * @param paymasterAddress - The paymaster contract address
   * @returns this for method chaining
   */
  byPaymaster(paymasterAddress: string): this {
    return this.where({ paymaster: paymasterAddress });
  }

  /**
   * Filter by multiple paymaster contracts
   *
   * @param paymasterAddresses - Array of paymaster contract addresses
   * @returns this for method chaining
   */
  byPaymasters(paymasterAddresses: string[]): this {
    return this.where({ paymaster_in: paymasterAddresses });
  }

  /**
   * Filter pools by joining fee range
   *
   * @param min - Minimum joining fee (in wei as string)
   * @param max - Maximum joining fee (in wei as string)
   * @returns this for method chaining
   */
  joiningFeeBetween(min: string, max: string): this {
    return this.where({
      joiningFee_gte: min,
      joiningFee_lte: max,
    });
  }

  /**
   * Filter pools with joining fee less than or equal to specified amount
   *
   * @param maxFee - Maximum joining fee (in wei as string)
   * @returns this for method chaining
   */
  maxJoiningFee(maxFee: string): this {
    return this.where({ joiningFee_lte: maxFee });
  }

  /**
   * Filter pools with minimum joining fee
   *
   * @param minFee - Minimum joining fee (in wei as string)
   * @returns this for method chaining
   */
  minJoiningFee(minFee: string): this {
    return this.where({ joiningFee_gte: minFee });
  }

  /**
   * Filter pools with minimum number of members
   *
   * @param count - Minimum member count
   * @returns this for method chaining
   */
  withMinMembers(count: number): this {
    return this.where({ memberCount_gte: count.toString() });
  }

  /**
   * Filter pools with maximum number of members
   *
   * @param count - Maximum member count
   * @returns this for method chaining
   */
  withMaxMembers(count: number): this {
    return this.where({ memberCount_lte: count.toString() });
  }

  /**
   * Filter pools by member count range
   *
   * @param min - Minimum member count
   * @param max - Maximum member count
   * @returns this for method chaining
   */
  memberCountBetween(min: number, max: number): this {
    return this.where({
      memberCount_gte: min.toString(),
      memberCount_lte: max.toString(),
    });
  }

  /**
   * Filter pools by total deposits range
   *
   * @param min - Minimum total deposits (in wei as string)
   * @param max - Maximum total deposits (in wei as string)
   * @returns this for method chaining
   */
  totalDepositsBetween(min: string, max: string): this {
    return this.where({
      totalDeposits_gte: min,
      totalDeposits_lte: max,
    });
  }

  /**
   * Filter pools created after specific timestamp
   *
   * @param timestamp - Minimum creation timestamp
   * @returns this for method chaining
   */
  createdAfter(timestamp: string): this {
    return this.where({ createdAtTimestamp_gt: timestamp });
  }

  /**
   * Filter pools created before specific timestamp
   *
   * @param timestamp - Maximum creation timestamp
   * @returns this for method chaining
   */
  createdBefore(timestamp: string): this {
    return this.where({ createdAtTimestamp_lt: timestamp });
  }

  /**
   * Order pools by specific field and direction
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
   * Order pools by creation date (newest first)
   *
   * @returns this for method chaining
   */
  orderByNewest(): this {
    return this.orderBy("createdAtTimestamp", "desc");
  }

  /**
   * Order pools by creation date (oldest first)
   *
   * @returns this for method chaining
   */
  orderByOldest(): this {
    return this.orderBy("createdAtTimestamp", "asc");
  }

  /**
   * Order pools by member count (highest first)
   *
   * @returns this for method chaining
   */
  orderByPopularity(): this {
    return this.orderBy("memberCount", "desc");
  }

  /**
   * Order pools by joining fee (lowest first)
   *
   * @returns this for method chaining
   */
  orderByAffordability(): this {
    return this.orderBy("joiningFee", "asc");
  }

  /**
   * Order pools by total deposits (highest first)
   *
   * @returns this for method chaining
   */
  orderByTotalDeposits(): this {
    return this.orderBy("totalDeposits", "desc");
  }

  /**
   * Build GraphQL query string for pools
   *
   * @private
   * @param fields - Fields to include in the query
   * @returns GraphQL query string
   */
  private buildPoolsQuery(fields: PoolFields[]): string {
    const fieldsList = fields.map((field) => `      ${field}`).join("\n");
    return `
      query GetPools(
        $first: Int!
        $skip: Int!
        $orderBy: Pool_orderBy
        $orderDirection: OrderDirection
        $where: Pool_filter
      ) {
        pools(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: $orderDirection
          where: $where
        ) {
${fieldsList}
          paymaster {
            id
            contractType
            address
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
   * Execute the query and return pool results
   *
   * @returns Promise resolving to array of Pool entities
   */
  async execute(): Promise<Pool[]> {
    const fields = this.selectedFields || DEFAULT_POOL_FIELDS;
    const query = this.buildPoolsQuery(fields);
    const variables = this.buildQueryVariables();

    const response = await this.client.executeQuery<{ pools: Pool[] }>(
      query,
      variables,
    );
    return response.pools;
  }

  /**
   * Execute the query and return serialized pool results
   *
   * @returns Promise resolving to array of SerializedPool entities
   */
  async executeAndSerialize(): Promise<SerializedPool[]> {
    const pools = await this.execute();
    return pools.map(serializePool);
  }

  /**
   * Get pool with members included
   *
   * @param memberLimit - Maximum number of members to fetch per pool
   * @returns PoolQueryWithMembersBuilder for extended functionality
   */
  withMembers(memberLimit: number = 100): PoolQueryWithMembersBuilder {
    return new PoolQueryWithMembersBuilder(
      this.client,
      this.getConfig(),
      memberLimit,
    );
  }

  /**
   * Get detailed pool information by ID
   *
   * @param poolId - Pool ID to fetch
   * @param includeMembers - Whether to include members list and root history
   * @param memberLimit - Maximum members to fetch when includeMembers=true
   * @returns Promise resolving to pool with optional members and root history, or null if not found
   */
  async getPoolById(
    poolId: string,
    includeMembers: boolean = false,
    memberLimit: number = 100,
  ): Promise<
    (Pool & { members?: PoolMember[]; merkleRoots?: MerkleRoot[] }) | null
  > {
    const poolQuery = new PoolQueryBuilder(this.client);

    if (includeMembers) {
      const poolsWithMembers = await poolQuery
        .byId(poolId)
        .withMembers(memberLimit)
        .execute();

      return poolsWithMembers.length > 0 ? poolsWithMembers[0] || null : null;
    } else {
      return await poolQuery.byId(poolId).first();
    }
  }

  /**
   * Get merkle root history for a specific pool
   *
   * @param poolId - Pool ID to get root history for
   * @param options - Pagination options
   * @returns Promise resolving to array of MerkleRoot entries
   */
  async getPoolRootHistory(
    poolId: string,
    options: { first?: number; skip?: number } = {},
  ): Promise<MerkleRoot[]> {
    const { first = 100, skip = 0 } = options;

    const query = `
      query GetPoolRootHistory(
        $poolId: String!
        $first: Int!
        $skip: Int!
      ) {
        merkleRoots(
          where: { pool: $poolId }
          first: $first
          skip: $skip
          orderBy: createdAtTimestamp
          orderDirection: desc
        ) {
          id
          root
          rootIndex
          createdAtBlock
          createdAtTransaction
          createdAtTimestamp
        }
      }
    `;

    const variables = { poolId, first, skip };

    const response = await this.client.executeQuery<{
      merkleRoots: MerkleRoot[];
    }>(query, variables);

    return response.merkleRoots;
  }

  /**
   * Get valid root indices for a specific pool
   *
   * @param poolId - Pool ID to get valid root indices for
   * @returns Promise resolving to array of valid root history items
   */
  async getValidRootIndices(poolId: string): Promise<RootHistoryItem[]> {
    const query = `
      query GetValidRootIndices($poolId: String!) {
        pool(id: $poolId) {
          id
          currentRootIndex
          rootHistoryCount
          merkleRoots(orderBy: rootIndex, orderDirection: asc) {
            id
            root
            rootIndex
            createdAtTimestamp
            createdAtBlock
          }
        }
      }
    `;

    const variables = { poolId };

    const response = await this.client.executeQuery<{
      pool: {
        id: string;
        currentRootIndex: number;
        rootHistoryCount: number;
        merkleRoots: RootHistoryItem[];
      } | null;
    }>(query, variables);

    return response.pool?.merkleRoots || [];
  }

  /**
   * Find the index for a specific merkle root in a pool
   *
   * @param poolId - Pool ID to search in
   * @param merkleRoot - Merkle root to find
   * @returns Promise resolving to root index info or null if not found
   */
  async findRootIndex(
    poolId: string,
    merkleRoot: string,
  ): Promise<{ id: string; root: string; rootIndex: number } | null> {
    const query = `
      query FindRootIndex($poolId: String!, $merkleRoot: BigInt!) {
        merkleRoots(where: { 
          pool: $poolId, 
          root: $merkleRoot
        }) {
          id
          root
          rootIndex
          createdAtTimestamp
        }
      }
    `;

    const variables = { poolId, merkleRoot };

    const response = await this.client.executeQuery<{
      merkleRoots: Array<{
        id: string;
        root: string;
        rootIndex: number;
        createdAtTimestamp: string;
      }>;
    }>(query, variables);

    const result = response.merkleRoots[0];
    return result
      ? {
          id: result.id,
          root: result.root,
          rootIndex: result.rootIndex,
        }
      : null;
  }

  /**
   * Check if a pool exists by ID
   *
   * @param poolId - Pool ID to check
   * @returns Promise resolving to true if pool exists, false otherwise
   */
  async poolExists(poolId: string): Promise<boolean> {
    const poolQuery = new PoolQueryBuilder(this.client);
    return await poolQuery.byId(poolId).exists();
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
 */
export class PoolQueryWithMembersBuilder extends BaseQueryBuilder<
  Pool & { members: PoolMember[]; merkleRoots: MerkleRoot[] },
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
   * Build GraphQL query string for pools with members
   *
   * @private
   * @returns GraphQL query string
   */
  private buildPoolsWithMembersQuery(): string {
    return `
      query GetPoolsWithMembers(
        $first: Int!
        $skip: Int!
        $orderBy: Pool_orderBy
        $orderDirection: OrderDirection
        $where: Pool_filter
        $memberLimit: Int!
      ) {
        pools(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: $orderDirection
          where: $where
        ) {
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
          members(first: $memberLimit, orderBy: addedAtTimestamp, orderDirection: desc) {
            id
            memberIndex
            identityCommitment
            merkleRootWhenAdded
            rootIndexWhenAdded
            addedAtBlock
            addedAtTransaction
            addedAtTimestamp
            gasUsed
            nullifierUsed
            nullifier
          }
          merkleRoots(orderBy: rootIndex, orderDirection: asc) {
            id
            root
            rootIndex
            createdAtBlock
            createdAtTransaction
            createdAtTimestamp
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
      memberLimit: this.memberLimit,
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
   * Execute query and return pools with their members and root history
   *
   * @returns Promise resolving to pools with member data and root history included
   */
  async execute(): Promise<
    (Pool & { members: PoolMember[]; merkleRoots: MerkleRoot[] })[]
  > {
    const query = this.buildPoolsWithMembersQuery();
    const variables = this.buildQueryVariables();

    const response = await this.client.executeQuery<{
      pools: (Pool & {
        members: PoolMember[];
        merkleRoots: MerkleRoot[];
      })[];
    }>(query, variables);

    return response.pools;
  }

  /**
   * Execute query and return serialized pools with members and root history
   *
   * @returns Promise resolving to array of SerializedPool entities with members and root history
   */
  async executeAndSerialize(): Promise<SerializedPool[]> {
    const poolsWithMembers = await this.execute();
    return poolsWithMembers.map(serializePool);
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
