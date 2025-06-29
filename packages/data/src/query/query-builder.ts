import type { SubgraphClient } from "../client/subgraph-client.js";
import { PoolQueryBuilder } from "./builders/pool-query-builder.js";
import { PoolMemberQueryBuilder } from "./builders/member-query-builder.js";
import { Pool, PoolMember } from "../types/subgraph.js";

/**
 * Main query builder that provides access to all entity-specific query builders
 *
 * This is the entry point for the fluent query API. It provides methods to start
 * building queries for different entity types (pools, members, etc.) and includes
 * some convenience methods for common cross-entity queries.
 *
 * @example
 * ```typescript
 * const queryBuilder = client.query();
 *
 * // Query pools
 * const pools = await queryBuilder.pools()
 *   .withMinMembers(10)
 *   .orderByNewest()
 *   .execute();
 *
 * // Query members
 * const members = await queryBuilder.members()
 *   .inPool("1")
 *   .activeOnly()
 *   .execute();
 * ```
 */
export class QueryBuilder {
  constructor(private client: SubgraphClient) {}

  /**
   * Start building a pools query
   *
   * @returns PoolQueryBuilder for fluent pool queries
   *
   * @example
   * ```typescript
   * const pools = await query.pools()
   *   .select("poolId", "joiningFee", "membersCount")
   *   .withMinMembers(5)
   *   .maxJoiningFee("1000000000000000000") // 1 ETH
   *   .orderByPopularity()
   *   .limit(20)
   *   .execute();
   * ```
   */
  pools(): PoolQueryBuilder {
    return new PoolQueryBuilder(this.client);
  }

  /**
   * Start building a pool members query
   *
   * @returns PoolMemberQueryBuilder for fluent member queries
   *
   * @example
   * ```typescript
   * const members = await query.members()
   *   .inPool("1")
   *   .select("identityCommitment", "joinedAt", "memberIndex")
   *   .activeOnly()
   *   .orderByNewestJoined()
   *   .limit(50)
   *   .execute();
   * ```
   */
  members(): PoolMemberQueryBuilder {
    return new PoolMemberQueryBuilder(this.client);
  }

  // Future: Add more entity builders as needed
  // /**
  //  * Start building a merkle root history query
  //  *
  //  * @returns MerkleRootHistoryQueryBuilder for fluent root history queries
  //  */
  // rootHistory(): MerkleRootHistoryQueryBuilder {
  //   return new MerkleRootHistoryQueryBuilder(this.client);
  // }

  /**
   * Convenience method: Get all pools with basic information
   *
   * @param limit - Maximum number of pools to return (default: 100)
   * @returns Promise resolving to array of pools
   *
   * @example
   * ```typescript
   * const allPools = await query.getAllPools(50);
   * ```
   */
  async getAllPools(limit: number = 100): Promise<Pool[]> {
    return await this.pools().limit(limit).orderByNewest().execute();
  }

  /**
   * Convenience method: Get popular pools (with many members)
   *
   * @param minMembers - Minimum number of members (default: 10)
   * @param limit - Maximum number of pools to return (default: 20)
   * @returns Promise resolving to array of popular pools
   *
   * @example
   * ```typescript
   * const popularPools = await query.getPopularPools(20, 10);
   * ```
   */
  async getPopularPools(
    minMembers: number = 10,
    limit: number = 20,
  ): Promise<Pool[]> {
    return await this.pools()
      .withMinMembers(minMembers)
      .orderByPopularity()
      .limit(limit)
      .execute();
  }

  /**
   * Convenience method: Get affordable pools (low joining fee)
   *
   * @param maxFee - Maximum joining fee in wei (default: 1 ETH)
   * @param limit - Maximum number of pools to return (default: 20)
   * @returns Promise resolving to array of affordable pools
   *
   * @example
   * ```typescript
   * // Pools with joining fee <= 0.5 ETH
   * const cheapPools = await query.getAffordablePools("500000000000000000", 15);
   * ```
   */
  async getAffordablePools(
    maxFee: string = "1000000000000000000", // 1 ETH in wei
    limit: number = 20,
  ): Promise<Pool[]> {
    return await this.pools()
      .maxJoiningFee(maxFee)
      .orderByAffordability()
      .limit(limit)
      .execute();
  }

  /**
   * Convenience method: Get recently created pools
   *
   * @param limit - Maximum number of pools to return (default: 10)
   * @returns Promise resolving to array of newest pools
   *
   * @example
   * ```typescript
   * const newPools = await query.getRecentPools(5);
   * ```
   */
  async getRecentPools(limit: number = 10): Promise<Pool[]> {
    return await this.pools().orderByNewest().limit(limit).execute();
  }

  /**
   * Convenience method: Find pools by identity commitment
   * Gets all pools where the given identity is a member
   *
   * @param identityCommitment - The identity commitment to search for
   * @returns Promise resolving to array of pools the identity belongs to
   *
   * @example
   * ```typescript
   * const userPools = await query.findPoolsByIdentity("0x123...");
   * ```
   */
  async findPoolsByIdentity(
    identityCommitment: string,
  ): Promise<Array<{ member: PoolMember; pool: Pool }>> {
    // Use the existing SubgraphClient method for this cross-entity query
    const response = await this.client.getPoolsByIdentity(identityCommitment);
    return response.data;
  }

  /**
   * Convenience method: Get pool statistics
   * Returns aggregated information about pools
   *
   * @returns Promise resolving to pool statistics
   *
   * @example
   * ```typescript
   * const stats = await query.getPoolStats();
   * console.log(`Total pools: ${stats.totalPools}`);
   * console.log(`Average members: ${stats.averageMembers}`);
   * ```
   */
  async getPoolStats(): Promise<{
    totalPools: number;
    totalMembers: number;
    averageMembers: number;
    totalDeposits: string;
    mostPopularPool?: Pool;
    newestPool?: Pool;
  }> {
    // Get all pools for statistics
    const allPools = await this.pools().execute();

    if (allPools.length === 0) {
      return {
        totalPools: 0,
        totalMembers: 0,
        averageMembers: 0,
        totalDeposits: "0",
      };
    }

    // Calculate statistics
    const totalPools = allPools.length;
    const totalMembers = allPools.reduce(
      (sum, pool) => sum + Number(pool.membersCount),
      0,
    );
    const averageMembers = Math.round(totalMembers / totalPools);

    // Sum total deposits (BigInt arithmetic)
    const totalDeposits = allPools.reduce((sum, pool) => {
      return (BigInt(sum) + BigInt(pool.totalDeposits)).toString();
    }, "0");

    // Find most popular pool (highest member count)
    const mostPopularPool = allPools.reduce((max, pool) =>
      Number(pool.membersCount) > Number(max.membersCount) ? pool : max,
    );

    // Find newest pool (latest createdAt)
    const newestPool = allPools.reduce((newest, pool) =>
      Number(pool.createdAt) > Number(newest.createdAt) ? pool : newest,
    );

    return {
      totalPools,
      totalMembers,
      averageMembers,
      totalDeposits,
      mostPopularPool,
      newestPool,
    };
  }

  /**
   * Convenience method: Search pools by criteria
   * Combines multiple common filters for pool discovery
   *
   * @param criteria - Search criteria object
   * @returns Promise resolving to array of matching pools
   *
   * @example
   * ```typescript
   * const pools = await query.searchPools({
   *   maxJoiningFee: "500000000000000000", // 0.5 ETH
   *   minMembers: 5,
   *   maxMembers: 100,
   *   createdAfter: "1704067200", // After Jan 1, 2024
   *   limit: 25
   * });
   * ```
   */
  async searchPools(criteria: {
    maxJoiningFee?: string;
    minJoiningFee?: string;
    minMembers?: number;
    maxMembers?: number;
    minDeposits?: string;
    createdAfter?: string;
    createdBefore?: string;
    orderBy?: "newest" | "oldest" | "popularity" | "affordability";
    limit?: number;
  }): Promise<Pool[]> {
    let query = this.pools();

    // Apply filters
    if (criteria.maxJoiningFee) {
      query = query.maxJoiningFee(criteria.maxJoiningFee);
    }
    if (criteria.minJoiningFee && criteria.maxJoiningFee) {
      query = query.joiningFeeBetween(
        criteria.minJoiningFee,
        criteria.maxJoiningFee,
      );
    }
    if (criteria.minMembers) {
      query = query.withMinMembers(criteria.minMembers);
    }
    if (criteria.maxMembers) {
      query = query.withMaxMembers(criteria.maxMembers);
    }
    if (criteria.minMembers && criteria.maxMembers) {
      query = query.memberCountBetween(
        criteria.minMembers,
        criteria.maxMembers,
      );
    }
    // Apply ordering
    switch (criteria.orderBy) {
      case "newest":
        query = query.orderByNewest();
        break;
      case "oldest":
        query = query.orderByOldest();
        break;
      case "popularity":
        query = query.orderByPopularity();
        break;
      case "affordability":
        query = query.orderByAffordability();
        break;
      default:
        query = query.orderByNewest(); // Default to newest
    }

    // Apply limit
    if (criteria.limit) {
      query = query.limit(criteria.limit);
    }

    return await query.execute();
  }

  /**
   * Get the underlying SubgraphClient for advanced operations
   *
   * @returns The SubgraphClient instance
   *
   * @example
   * ```typescript
   * const client = query.getClient();
   * const customResponse = await client.getPoolDetails("1");
   * ```
   */
  getClient(): SubgraphClient {
    return this.client;
  }
}
