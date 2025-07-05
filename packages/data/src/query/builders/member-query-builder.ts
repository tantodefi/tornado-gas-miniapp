/**
 * Query builder for PoolMember entities
 * Updated for the new network-aware schema structure
 */

import type { SubgraphClient } from "../../client/subgraph-client.js";
import type { PoolMember, NetworkName } from "../../types/subgraph.js";

import { PoolMemberFields, PoolMemberWhereInput } from "../types.js";
import { BaseQueryBuilder } from "./base-query-builder.js";

export type PoolMemberOrderBy =
  | "addedAtTimestamp"
  | "memberIndex"
  | "gasUsed"
  | "rootIndexWhenAdded";

/**
 * Query builder for PoolMember entities
 *
 * Provides a fluent interface for building complex pool member queries
 * with support for identity tracking and nullifier usage.
 */
export class PoolMemberQueryBuilder extends BaseQueryBuilder<
  PoolMember,
  PoolMemberFields,
  PoolMemberWhereInput,
  PoolMemberOrderBy
> {
  // private config: PoolMemberQueryConfig = {};

  constructor(client: SubgraphClient) {
    super(client, "poolMembers", "addedAtTimestamp", "desc");
  }

  /**
   * Override default fields for PoolMember entity.
   */
  protected getDefaultFields(): string {
    return `
      id
      network
      chainId
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
      pool {
        id
        poolId
        network
        chainId
        paymaster {
          id
          address
        }
      }
    `;
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
   * @returns PoolMemberQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const members = await client.query().poolMembers()
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
   * @returns PoolMemberQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const poolMembers = await client.query().poolMembers()
   *   .byNetwork("base-sepolia")
   *   .byPool("123")
   *   .execute();
   * ```
   */
  byPool(poolId: string): this {
    this.where({ pool_: { poolId: poolId } });
    return this;
  }

  /**
   * Filter by member index
   *
   * @param memberIndex - Member index
   * @returns PoolMemberQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const member = await client.query().poolMembers()
   *   .byNetwork("base-sepolia")
   *   .byPool("123")
   *   .byMemberIndex("0")
   *   .first();
   * ```
   */
  byId(
    network: NetworkName,
    poolId: string,
    memberIndex: string | number,
  ): this {
    this.where({ id: `${network}-${poolId}-${memberIndex.toString()}` });
    this.byNetwork(network); // Also set network for clarity and consistency
    return this;
  }

  /**
   * Filter by member index
   *
   * @param memberIndex - Member index
   * @returns PoolMemberQueryBuilder for method chaining
   */
  byMemberIndex(memberIndex: string | number): this {
    this.where({ memberIndex: memberIndex.toString() });
    return this;
  }

  /**
   * Filter by identity commitment
   *
   * @param identityCommitment - Identity commitment
   * @returns PoolMemberQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const userMemberships = await client.query().poolMembers()
   *   .byNetwork("base-sepolia")
   *   .byIdentityCommitment("0x123...")
   *   .execute();
   * ```
   */
  byIdentityCommitment(identityCommitment: string): this {
    this.where({ identityCommitment: identityCommitment });
    return this;
  }

  /**
   * Filter by paymaster address
   *
   * @param paymaster - Paymaster contract address
   * @returns PoolMemberQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const paymasterMembers = await client.query().poolMembers()
   *   .byNetwork("base-sepolia")
   *   .byPaymaster("0x3BEeC075aC5A77fFE0F9ee4bbb3DCBd07fA93fbf")
   *   .execute();
   * ```
   */
  byPaymaster(paymaster: string): this {
    this.where({ pool_: { paymaster_: { address: paymaster } } });
    return this;
  }

  /**
   * Filter by minimum gas used (GasLimited tracking)
   *
   * @param minGasUsed - Minimum gas used in wei (as string)
   * @returns PoolMemberQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const heavyGasUsers = await client.query().poolMembers()
   *   .byNetwork("base-sepolia")
   *   .withMinGasUsed("1000000000000000000") // 1 ETH worth of gas
   *   .execute();
   * ```
   */
  withMinGasUsed(minGasUsed: string): this {
    this.where({ gasUsed_gte: minGasUsed });
    return this;
  }

  /**
   * Filter by maximum gas used
   *
   * @param maxGasUsed - Maximum gas used in wei (as string)
   * @returns PoolMemberQueryBuilder for method chaining
   */
  withMaxGasUsed(maxGasUsed: string): this {
    this.where({ gasUsed_lte: maxGasUsed });
    return this;
  }

  /**
   * Filter by nullifier usage status
   *
   * @param used - Whether nullifier has been used
   * @returns PoolMemberQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const activeMembers = await client.query().poolMembers()
   *   .byNetwork("base-sepolia")
   *   .withNullifierUsed(true)
   *   .execute();
   * ```
   */
  withNullifierUsed(used: boolean = true): this {
    this.where({ nullifierUsed: used });
    return this;
  }

  /**
   * Filter by join date (after)
   *
   * @param timestamp - Timestamp string or number
   * @returns PoolMemberQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const recentMembers = await client.query().poolMembers()
   *   .byNetwork("base-sepolia")
   *   .joinedAfter("1704067200") // 2024-01-01
   *   .execute();
   * ```
   */
  joinedAfter(timestamp: string | number): this {
    this.where({ addedAtTimestamp_gte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by join date (before)
   *
   * @param timestamp - Timestamp string or number
   * @returns PoolMemberQueryBuilder for method chaining
   */
  joinedBefore(timestamp: string | number): this {
    this.where({ addedAtTimestamp_lte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by merkle root index when added
   *
   * @param rootIndex - Merkle root index
   * @returns PoolMemberQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const membersAtRoot = await client.query().poolMembers()
   *   .byNetwork("base-sepolia")
   *   .byPool("123")
   *   .atMerkleRootIndex(5)
   *   .execute();
   * ```
   */
  atMerkleRootIndex(rootIndex: number): this {
    this.where({ rootIndexWhenAdded: rootIndex });
    return this;
  }

  /**
   * ========================================
   * ORDERING METHODS
   * ========================================
   */

  /**
   * Order by join date (newest first)
   *
   * @returns PoolMemberQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const recentMembers = await client.query().poolMembers()
   *   .byNetwork("base-sepolia")
   *   .orderByJoinDate()
   *   .limit(10)
   *   .execute();
   * ```
   */
  orderByJoinDate(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("addedAtTimestamp", direction);
    return this;
  }

  /**
   * Order by member index
   *
   * @returns PoolMemberQueryBuilder for method chaining
   */
  orderByMemberIndex(direction: "asc" | "desc" = "asc"): this {
    this.orderBy("memberIndex", direction);
    return this;
  }

  /**
   * Order by gas used (highest first)
   *
   * @returns PoolMemberQueryBuilder for method chaining
   */
  orderByGasUsed(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("gasUsed", direction);
    return this;
  }

  /**
   * Order by merkle root index
   *
   * @returns PoolMemberQueryBuilder for method chaining
   */
  orderByMerkleRootIndex(direction: "asc" | "desc" = "asc"): this {
    this.orderBy("rootIndexWhenAdded", direction);
    return this;
  }

  /**
   * ========================================
   * SPECIAL QUERIES
   * ========================================
   */

  /**
   * Get pools by identity commitment (user's memberships)
   *
   * @param identityCommitment - Identity commitment
   * @param network - Network identifier
   * @returns Promise resolving to array of pool memberships
   */
  async getPoolsByIdentity(
    identityCommitment: string,
    network: NetworkName,
  ): Promise<PoolMember[]> {
    return this.clone()
      .byIdentityCommitment(identityCommitment)
      .byNetwork(network)
      .execute();
  }

  /**
   * Get member statistics for a pool
   *
   * @param poolId - Pool ID
   * @param network - Network identifier
   * @returns Promise resolving to member statistics
   */
  async getPoolMemberStats(
    poolId: string,
    network: NetworkName,
  ): Promise<{
    totalMembers: number;
    activeMembers: number;
    totalGasUsed: string;
    averageGasUsed: string;
    nullifierUsageRate: number;
    oldestMember: string;
    newestMember: string;
  }> {
    const members = await this.clone()
      .byNetwork(network)
      .byPool(poolId)
      .execute();

    const totalMembers = members.length;
    const activeMembers = members.filter(
      (member) => member.nullifierUsed,
    ).length;
    const totalGasUsed = members.reduce(
      (sum, member) => sum + (member.gasUsed ? BigInt(member.gasUsed) : 0n),
      0n,
    );
    const averageGasUsed =
      totalMembers > 0 ? totalGasUsed / BigInt(totalMembers) : 0n;
    const nullifierUsageRate =
      totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

    const oldestMember = members.reduce(
      (oldest, member) =>
        BigInt(member.addedAtTimestamp) < BigInt(oldest?.addedAtTimestamp ?? 0)
          ? member
          : oldest,
      members[0],
    );

    const newestMember = members.reduce(
      (newest, member) =>
        BigInt(member.addedAtTimestamp) > BigInt(newest?.addedAtTimestamp ?? 0)
          ? member
          : newest,
      members[0],
    );

    return {
      totalMembers,
      activeMembers,
      totalGasUsed: totalGasUsed.toString(),
      averageGasUsed: averageGasUsed.toString(),
      nullifierUsageRate: Math.round(nullifierUsageRate * 100) / 100,
      oldestMember: oldestMember?.addedAtTimestamp.toString() || "N/A",
      newestMember: newestMember?.addedAtTimestamp.toString() || "N/A",
    };
  }

  /**
   * Get member activity timeline for a pool
   *
   * @param poolId - Pool ID
   * @param network - Network identifier
   * @param days - Number of days to look back
   * @returns Promise resolving to daily member activity
   */
  async getMemberActivityTimeline(
    poolId: string,
    network: NetworkName,
    days: number = 30,
  ): Promise<
    Array<{
      date: string;
      newMembers: number;
      activeMembers: number;
      totalGasUsed: string;
    }>
  > {
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - days * 24 * 60 * 60;

    const members = await this.clone()
      .byNetwork(network)
      .byPool(poolId)
      .joinedAfter(startTime)
      .orderByJoinDate("asc")
      .execute();

    // Group by date
    const timeline: Record<
      string,
      {
        newMembers: number;
        activeMembers: number;
        totalGasUsed: bigint;
      }
    > = {};

    for (const member of members) {
      const date = new Date(Number(member.addedAtTimestamp) * 1000)
        .toISOString()
        .split("T")[0]!;

      if (!timeline[date]) {
        timeline[date] = {
          newMembers: 0,
          activeMembers: 0,
          totalGasUsed: 0n,
        };
      }

      timeline[date].newMembers += 1;
      if (member.nullifierUsed) {
        timeline[date].activeMembers += 1;
      }
      if (member.gasUsed) {
        timeline[date].totalGasUsed += BigInt(member.gasUsed);
      }
    }

    return Object.entries(timeline).map(([date, stats]) => ({
      date,
      newMembers: stats.newMembers,
      activeMembers: stats.activeMembers,
      totalGasUsed: stats.totalGasUsed.toString(),
    }));
  }
}
