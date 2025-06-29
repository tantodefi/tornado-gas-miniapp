import type { SubgraphClient } from "../client/subgraph-client.js";
import { PoolQueryBuilder } from "./builders/pool-query-builder.js";
import { PoolMemberQueryBuilder } from "./builders/member-query-builder.js";

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
