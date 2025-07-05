/**
 * Query builder for Pool entities
 * Updated for the new network-aware schema structure
 */

import type { SubgraphClient } from "../../client/subgraph-client.js";
import type { Pool, NetworkName } from "../../types/subgraph.js";
import { BaseQueryBuilder } from "./base-query-builder.js";

import { GET_POOL_DETAILS } from "../../client/queries.js";
import { PoolFields, PoolWhereInput } from "../types.js";

export type PoolOrderBy =
  | "createdAtTimestamp"
  | "memberCount"
  | "totalDeposits"
  | "joiningFee"
  | "lastUpdatedTimestamp"
  | "poolId";

/**
 * Query builder for Pool entities
 *
 * Provides a fluent interface for building complex pool queries
 * with full support for the new network-aware schema.
 */
export class PoolQueryBuilder extends BaseQueryBuilder<
  Pool,
  PoolFields,
  PoolWhereInput,
  PoolOrderBy
> {
  private includeMembers: boolean = false;
  private membersLimit: number = 10;

  constructor(client: SubgraphClient) {
    super(client, "pools", "poolId", "desc");
  }

  /**
   * Override default fields for Pool entity.
   */
  protected getDefaultFields(): string {
    const baseFields = `
      id
      poolId
      network
      chainId
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
    `;

    // If members are requested, include them in the query
    if (this.includeMembers) {
      return (
        baseFields +
        `
      members(first: ${this.membersLimit}, orderBy: addedAtTimestamp, orderDirection: desc) {
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
      `
      );
    }

    return baseFields;
  }
  /**
   * ========================================
   * FILTERING METHODS
   * ========================================
   */

  /**
   * Filter by network
   *
   * @param network - Network identifier
   * @returns PoolQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const pools = await client.query().pools()
   *   .byNetwork("base-sepolia")
   *   .execute();
   * ```
   */
  byNetwork(network: NetworkName): this {
    this.where({ network: network });
    return this;
  }

  /**
   * Filter by pool ID
   *
   * @param poolId - Pool ID
   * @returns PoolQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const pool = await client.query().pools()
   *   .byNetwork("base-sepolia")
   *   .byPoolId("123")
   *   .first();
   * ```
   */
  byPoolId(poolId: string): this {
    // Note: The GraphQL schema expects `poolId` as a `BigInt` for direct filtering,
    // but the `id` field (network-prefixed) is the primary ID.
    // If filtering by numeric `poolId`, it should be converted to string.
    // For `GET_POOL_DETAILS`, the `id` is "network-poolId".
    // This method will set the `id` for `GET_POOL_DETAILS` or `poolId` for general filtering.
    this.where({ poolId: poolId });
    return this;
  }

  /**
   * Filter by paymaster address
   *
   * @param paymaster - Paymaster contract address
   * @returns PoolQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const pools = await client.query().pools()
   *   .byNetwork("base-sepolia")
   *   .byPaymaster("0x3BEeC075aC5A77fFE0F9ee4bbb3DCBd07fA93fbf")
   *   .execute();
   * ```
   */
  byPaymaster(paymaster: string): this {
    this.where({ paymaster_: { address: paymaster } });
    return this;
  }

  /**
   * Filter by minimum member count
   *
   * @param minMembers - Minimum number of members
   * @returns PoolQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const popularPools = await client.query().pools()
   *   .byNetwork("base-sepolia")
   *   .withMinMembers(10)
   *   .execute();
   * ```
   */
  withMinMembers(minMembers: number): this {
    this.where({ memberCount_gte: minMembers.toString() });
    return this;
  }

  /**
   * Filter by maximum member count
   *
   * @param maxMembers - Maximum number of members
   * @returns PoolQueryBuilder for method chaining
   */
  withMaxMembers(maxMembers: number): this {
    this.where({ memberCount_lte: maxMembers.toString() });
    return this;
  }

  /**
   * Filter by minimum total deposits
   *
   * @param minDeposits - Minimum total deposits in wei (as string)
   * @returns PoolQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const wellFundedPools = await client.query().pools()
   *   .byNetwork("base-sepolia")
   *   .withMinDeposits("1000000000000000000") // 1 ETH
   *   .execute();
   * ```
   */
  withMinDeposits(minDeposits: string): this {
    this.where({ totalDeposits_gte: minDeposits });
    return this;
  }

  /**
   * Filter by maximum total deposits
   *
   * @param maxDeposits - Maximum total deposits in wei (as string)
   * @returns PoolQueryBuilder for method chaining
   */
  withMaxDeposits(maxDeposits: string): this {
    this.where({ totalDeposits_lte: maxDeposits });
    return this;
  }

  /**
   * Filter by minimum joining fee
   *
   * @param minJoiningFee - Minimum joining fee in wei (as string)
   * @returns PoolQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const expensivePools = await client.query().pools()
   *   .byNetwork("base-sepolia")
   *   .withMinJoiningFee("100000000000000000") // 0.1 ETH
   *   .execute();
   * ```
   */
  withMinJoiningFee(minJoiningFee: string): this {
    this.where({ joiningFee_gte: minJoiningFee });
    return this;
  }

  /**
   * Filter by maximum joining fee
   *
   * @param maxJoiningFee - Maximum joining fee in wei (as string)
   * @returns PoolQueryBuilder for method chaining
   */
  withMaxJoiningFee(maxJoiningFee: string): this {
    this.where({ joiningFee_lte: maxJoiningFee });
    return this;
  }

  /**
   * Filter by creation date (after)
   *
   * @param timestamp - Timestamp string or number
   * @returns PoolQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const recentPools = await client.query().pools()
   *   .byNetwork("base-sepolia")
   *   .createdAfter("1704067200") // 2024-01-01
   *   .execute();
   * ```
   */
  createdAfter(timestamp: string | number): this {
    this.where({ createdAtTimestamp_gte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by creation date (before)
   *
   * @param timestamp - Timestamp string or number
   * @returns PoolQueryBuilder for method chaining
   */
  createdBefore(timestamp: string | number): this {
    this.where({ createdAtTimestamp_lte: timestamp.toString() });
    return this;
  }

  /**
   * Filter only pools with members
   *
   * @returns PoolQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const activePools = await client.query().pools()
   *   .byNetwork("base-sepolia")
   *   .withMembers(20)  // Include up to 20 members
   *   .execute();
   * ```
   */
  withMembers(limit: number = 10): this {
    this.includeMembers = true;
    this.membersLimit = limit;
    return this;
  }

  /**
   * Filter only active pools (positive deposits)
   *
   * @returns PoolQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const activePools = await client.query().pools()
   *   .byNetwork("base-sepolia")
   *   .onlyActive()
   *   .execute();
   * ```
   */
  onlyActive(): this {
    this.where({ totalDeposits_gt: "0" });
    return this;
  }

  /**
   * ========================================
   * ORDERING METHODS
   * ========================================
   */

  /**
   * Order by member count (most popular first)
   *
   * @returns PoolQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const popularPools = await client.query().pools()
   *   .byNetwork("base-sepolia")
   *   .orderByPopularity()
   *   .limit(10)
   *   .execute();
   * ```
   */
  orderByPopularity(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("memberCount", direction);
    return this;
  }

  /**
   * Order by total deposits
   *
   * @returns PoolQueryBuilder for method chaining
   */
  orderByDeposits(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalDeposits", direction);
    return this;
  }

  /**
   * Order by joining fee
   *
   * @returns PoolQueryBuilder for method chaining
   */
  orderByJoiningFee(direction: "asc" | "desc" = "asc"): this {
    this.orderBy("joiningFee", direction);
    return this;
  }

  /**
   * Order by creation date (newest first)
   *
   * @returns PoolQueryBuilder for method chaining
   */
  orderByCreation(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("createdAtTimestamp", direction);
    return this;
  }

  /**
   * Order by last activity
   *
   * @returns PoolQueryBuilder for method chaining
   */
  orderByActivity(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("lastUpdatedTimestamp", direction);
    return this;
  }

  /**
   * Order by pool ID
   *
   * @returns PoolQueryBuilder for method chaining
   */
  orderByPoolId(direction: "asc" | "desc" = "asc"): this {
    this.orderBy("poolId", direction);
    return this;
  }

  /**
   * ========================================
   * SPECIAL QUERIES
   * ========================================
   */

  /**
   * Get pool with detailed information including members and merkle roots
   *
   * @param membersLimit - Maximum number of members to fetch
   * @param rootsLimit - Maximum number of merkle roots to fetch
   * @returns Promise resolving to pool with detailed information
   */
  async withDetails(
    membersLimit: number = 100,
    rootsLimit: number = 50,
  ): Promise<
    | (Pool & {
        members: any[];
        merkleRoots: any[];
      })
    | null
  > {
    if (!this.config.where?.poolId || !this.config.where?.network) {
      throw new Error("Pool ID and network are required for withDetails query");
    }

    const network = this.config.where.network;
    const poolId = this.config.where.poolId;
    const id = `${network}-${poolId}`;

    const result = await this.client.executeQuery<{
      pool: Pool & {
        members: any[];
        merkleRoots: any[];
      };
    }>(GET_POOL_DETAILS, {
      id,
      membersFirst: membersLimit,
      rootsFirst: rootsLimit,
    });

    return result.pool || null;
  }

  /**
   * Get pools with minimum member count
   *
   * @param minMembers - Minimum number of members
   * @returns Promise resolving to array of pools with minimum members
   */
  async withMinimumMembers(minMembers: number): Promise<Pool[]> {
    if (!this.config.where?.network) {
      throw new Error("Network is required for withMinimumMembers query");
    }

    return this.clone()
      .withMinMembers(minMembers)
      .orderByPopularity("desc")
      .execute();
  }

  /**
   * Get pool statistics
   *
   * @returns Promise resolving to pool statistics
   */
  async getStatistics(): Promise<{
    totalPools: number;
    totalMembers: string;
    totalDeposits: string;
    averageJoiningFee: string;
    averageMemberCount: number;
  }> {
    // Fetch all relevant pools using the current builder's filters
    const pools = await this.execute();

    const totalPools = pools.length;
    const totalMembers = pools.reduce(
      (sum, pool) => sum + pool.memberCount,
      0n,
    );
    const totalDeposits = pools.reduce(
      (sum, pool) => sum + pool.totalDeposits,
      0n,
    );
    const totalJoiningFees = pools.reduce(
      (sum, pool) => sum + pool.joiningFee,
      0n,
    );

    // Ensure division by BigInt(totalPools) to avoid issues with large numbers
    const averageJoiningFee =
      totalPools > 0 ? totalJoiningFees / BigInt(totalPools) : 0n;
    const averageMemberCount =
      totalPools > 0 ? Number(totalMembers) / totalPools : 0;

    return {
      totalPools,
      totalMembers: totalMembers.toString(),
      totalDeposits: totalDeposits.toString(),
      averageJoiningFee: averageJoiningFee.toString(),
      averageMemberCount: Math.round(averageMemberCount * 100) / 100,
    };
  }
}
