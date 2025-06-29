import { BaseQueryBuilder } from "./base-query-builder.js";
import { PoolFields, PoolWhereInput, RootHistoryItem } from "../types.js";
import { Pool, PoolMember, MerkleRootHistory } from "../../types/subgraph.js";
import type { SubgraphClient } from "../../client/subgraph-client.js";
import { serializePool, SerializedPool } from "../../transformers/index.js";

/**
 * Default fields to fetch when no specific fields are selected
 * Matches the GET_ALL_POOLS query from queries.ts
 */
const DEFAULT_POOL_FIELDS: PoolFields[] = [
  "id",
  "poolId",
  "joiningFee",
  "membersCount",
  "createdAt",
];

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
    return this.where({ poolId });
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
      joiningFee_gte: min,
      joiningFee_lte: max,
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
    return this.where({ joiningFee_lte: maxFee });
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
    return this.where({ membersCount_gte: count.toString() });
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
    return this.where({ membersCount_lte: count.toString() });
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
      membersCount_gte: min.toString(),
      membersCount_lte: max.toString(),
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
    // Use selected fields or default fields
    const fields = this.selectedFields || DEFAULT_POOL_FIELDS;

    // Build query and variables
    const query = this.buildPoolsQuery(fields);
    const variables = this.buildQueryVariables();

    // Execute via generic SubgraphClient method
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
   * Get detailed pool information by ID (convenience method)
   *
   * Internally uses the query builder methods for consistency.
   * This replaces the old SubgraphClient.getPoolDetails() method.
   *
   * @param poolId - Pool ID to fetch
   * @param includeMembers - Whether to include members list and root history (default: false)
   * @param memberLimit - Maximum members to fetch when includeMembers=true (default: 100)
   * @returns Promise resolving to pool with optional members and root history, or null if not found
   *
   * @example
   * ```typescript
   * // Get pool with basic info only
   * const pool = await client.query().pools().getPoolById('1');
   *
   * // Get pool with members and root history included
   * const poolWithDetails = await client.query().pools().getPoolById('1', true, 50);
   * ```
   */
  async getPoolById(
    poolId: string,
    includeMembers: boolean = false,
    memberLimit: number = 100,
  ): Promise<
    | (Pool & { members?: PoolMember[]; rootHistory?: MerkleRootHistory[] })
    | null
  > {
    // Create a new query builder instance to avoid affecting current state
    const poolQuery = new PoolQueryBuilder(this.client);

    if (includeMembers) {
      // Use withMembers() for pools with member data and root history
      const poolsWithMembers = await poolQuery
        .byId(poolId)
        .withMembers(memberLimit)
        .execute();

      return poolsWithMembers.length > 0 ? poolsWithMembers[0] || null : null;
    } else {
      // Use regular query for basic pool info
      return await poolQuery.byId(poolId).first();
    }
  }

  /**
   * Get merkle root history for a specific pool (convenience method)
   *
   * Internally uses query builder pattern for consistency.
   * This replaces the old SubgraphClient.getPoolRootHistory() method.
   *
   * @param poolId - Pool ID to get root history for
   * @param options - Pagination options
   * @returns Promise resolving to array of MerkleRootHistory entries
   *
   * @example
   * ```typescript
   * // Get recent root history
   * const history = await client.query().pools().getPoolRootHistory('1');
   *
   * // Get root history with pagination
   * const history = await client.query().pools().getPoolRootHistory('1', { first: 50, skip: 10 });
   * ```
   */
  async getPoolRootHistory(
    poolId: string,
    options: { first?: number; skip?: number } = {},
  ): Promise<MerkleRootHistory[]> {
    const { first = 100, skip = 0 } = options;

    const query = `
      query GetPoolRootHistory(
        $poolId: String!
        $first: Int!
        $skip: Int!
      ) {
        merkleRootHistories(
          where: { pool: $poolId }
          first: $first
          skip: $skip
          orderBy: createdAt
          orderDirection: desc
        ) {
          id
          index
          merkleRoot
          createdAt
          createdAtBlock
          isValid
          transactionHash
        }
      }
    `;

    const variables = {
      poolId,
      first,
      skip,
    };

    // Execute via generic SubgraphClient method
    const response = await this.client.executeQuery<{
      merkleRootHistories: MerkleRootHistory[];
    }>(query, variables);

    return response.merkleRootHistories;
  }

  /**
   * Get valid root indices for a specific pool (convenience method)
   *
   * Internally uses query builder pattern for consistency.
   * This replaces the old SubgraphClient.getValidRootIndices() method.
   *
   * @param poolId - Pool ID to get valid root indices for
   * @returns Promise resolving to array of valid root history items
   *
   * @example
   * ```typescript
   * const validRoots = await client.query().pools().getValidRootIndices('1');
   * ```
   */
  async getValidRootIndices(poolId: string): Promise<RootHistoryItem[]> {
    const query = `
      query GetValidRootIndices($poolId: String!) {
        pool(id: $poolId) {
          id
          currentRootIndex
          rootHistoryCount
          rootHistory(where: { isValid: true }, orderBy: index, orderDirection: asc) {
            index
            merkleRoot
            createdAt
            createdAtBlock
          }
        }
      }
    `;

    const variables = { poolId };

    // Execute via generic SubgraphClient method
    const response = await this.client.executeQuery<{
      pool: {
        id: string;
        currentRootIndex: number;
        rootHistoryCount: number;
        rootHistory: RootHistoryItem[];
      } | null;
    }>(query, variables);

    return response.pool?.rootHistory || [];
  }

  /**
   * Find the index for a specific merkle root in a pool (convenience method)
   *
   * Internally uses query builder pattern for consistency.
   * This replaces the old SubgraphClient.findRootIndex() method.
   *
   * @param poolId - Pool ID to search in
   * @param merkleRoot - Merkle root to find
   * @returns Promise resolving to root index info or null if not found
   *
   * @example
   * ```typescript
   * const rootInfo = await client.query().pools().findRootIndex('1', '0x123...');
   * if (rootInfo) {
   *   console.log(`Root found at index: ${rootInfo.index}`);
   * }
   * ```
   */
  async findRootIndex(
    poolId: string,
    merkleRoot: string,
  ): Promise<{ index: number; merkleRoot: string } | null> {
    const query = `
      query FindRootIndex($poolId: String!, $merkleRoot: BigInt!) {
        merkleRootHistories(where: { 
          pool: $poolId, 
          merkleRoot: $merkleRoot, 
          isValid: true 
        }) {
          index
          merkleRoot
          createdAt
          isValid
        }
      }
    `;

    const variables = {
      poolId,
      merkleRoot,
    };

    // Execute via generic SubgraphClient method
    const response = await this.client.executeQuery<{
      merkleRootHistories: Array<{
        index: number;
        merkleRoot: string;
        createdAt: string;
        isValid: boolean;
      }>;
    }>(query, variables);

    const result = response.merkleRootHistories[0];
    return result
      ? {
          index: result.index,
          merkleRoot: result.merkleRoot,
        }
      : null;
  }

  /**
   * Check if a pool exists by ID (convenience method)
   *
   * @param poolId - Pool ID to check
   * @returns Promise resolving to true if pool exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await client.query().pools().poolExists('1');
   * ```
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
 *
 * This builder extends the base functionality to fetch pools along with their
 * member information and root history, useful for detailed pool analysis.
 */
export class PoolQueryWithMembersBuilder extends BaseQueryBuilder<
  Pool & { members: PoolMember[]; rootHistory: MerkleRootHistory[] },
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
          merkleTreeDuration
          totalDeposits
          currentMerkleTreeRoot
          membersCount
          merkleTreeDepth
          createdAt
          createdAtBlock
          currentRootIndex
          rootHistoryCount
          members(first: $memberLimit, where: { isActive: true }, orderBy: joinedAt, orderDirection: desc) {
            id
            identityCommitment
            memberIndex
            joinedAt
            joinedAtBlock
            isActive
          }
          rootHistory(where: { isValid: true }, orderBy: index, orderDirection: asc) {
            index
            merkleRoot
            createdAt
            createdAtBlock
            isValid
            transactionHash
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
      memberLimit: this.memberLimit,
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
   * Execute query and return pools with their members and root history
   *
   * @returns Promise resolving to pools with member data and root history included
   */
  async execute(): Promise<
    (Pool & { members: PoolMember[]; rootHistory: MerkleRootHistory[] })[]
  > {
    // Build query and variables
    const query = this.buildPoolsWithMembersQuery();
    const variables = this.buildQueryVariables();

    // Execute via generic SubgraphClient method
    const response = await this.client.executeQuery<{
      pools: (Pool & {
        members: PoolMember[];
        rootHistory: MerkleRootHistory[];
      })[];
    }>(query, variables);

    return response.pools;
  }

  /**
   * Execute query and return serialized pools with members and root history
   *
   * @returns Promise resolving to array of SerializedPool entities with members and root history
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
    // Serialize each pool (serializePool handles the members and rootHistory arrays automatically)
    return poolsWithMembers.map(serializePool);
  }

  /**
   * Count pools (members and root history are not counted, only pools)
   *
   * @returns Promise resolving to number of matching pools
   */
  async count(): Promise<number> {
    // Build a simple count query (just pool fields, no members or root history)
    const countQuery = `
      query CountPoolsWithMembers(
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
          id
        }
      }
    `;

    const variables = this.buildQueryVariables();
    // Remove memberLimit from count query
    delete variables.memberLimit;

    const response = await this.client.executeQuery<{
      pools: { id: string }[];
    }>(countQuery, variables);

    return response.pools.length;
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
