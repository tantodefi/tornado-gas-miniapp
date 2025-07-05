// merkle-root-query-builder.ts (Refactored)

import type { SubgraphClient } from "../../client/subgraph-client.js";
import type { MerkleRoot, NetworkName } from "../../types/subgraph.js";
import { MerkleRootFields, MerkleRootWhereInput } from "../types.js";
import { BaseQueryBuilder } from "./base-query-builder.js";

export type MerkleRootOrderBy =
  | "rootIndex"
  | "createdAtTimestamp"
  | "createdAtBlock"
  | "root";

/**
 * Query builder for MerkleRoot entities
 *
 * Provides a fluent interface for building merkle root queries
 * with support for pool filtering, root validation, and history tracking.
 */
export class MerkleRootQueryBuilder extends BaseQueryBuilder<
  MerkleRoot,
  MerkleRootFields,
  MerkleRootWhereInput,
  MerkleRootOrderBy
> {
  constructor(private subgraphClient: SubgraphClient) {
    // Default order by rootIndex descending.
    // Assuming the entity name in the subgraph schema is `merkleRoots`
    super(subgraphClient, "merkleRoots", "rootIndex", "desc");
  }

  /**
   * Override default fields for MerkleRoot entity.
   */
  protected getDefaultFields(): string {
    return `
      id
      rootIndex
      root
      pool {
        id
        poolId
        network
      }
      createdAtTimestamp
      createdAtBlock
      createdAtTransaction
    `;
  }

  /**
   * ========================================
   * FILTERING METHODS
   * ========================================
   */

  /**
   * Filter by network.
   *
   * @param network - Network identifier (e.g., "base-sepolia").
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const roots = await client.query().merkleRoots()
   * .byNetwork("base-sepolia")
   * .execute();
   * ```
   */
  byNetwork(network: NetworkName): this {
    this.where({ network: network });
    return this;
  }

  /**
   * Filter by pool ID.
   *
   * @param poolId - Pool ID.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const poolRoots = await client.query().merkleRoots()
   * .byNetwork("base-sepolia")
   * .byPool("0x123...")
   * .execute();
   * ```
   */
  byPool(poolId: string): this {
    // Assuming 'pool' is a direct relation field in MerkleRoot with an 'id' or 'poolId' property
    // Adjust `pool` to `pool_` or `pool.id` depending on your subgraph schema
    this.where({ pool: poolId });
    return this;
  }

  /**
   * Filter by a specific root index.
   *
   * @param rootIndex - Root index.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const rootAtIndex = await client.query().merkleRoots()
   * .byNetwork("base-sepolia")
   * .byPool("0x123...")
   * .atIndex(5)
   * .first();
   * ```
   */
  atIndex(rootIndex: number): this {
    this.where({ rootIndex: rootIndex });
    return this;
  }

  /**
   * Filter by a specific root value.
   *
   * @param root - Root value (e.g., "0xabc...").
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const rootInfo = await client.query().merkleRoots()
   * .byNetwork("base-sepolia")
   * .byPool("0x123...")
   * .byRoot("0x123...")
   * .first();
   * ```
   */
  byRoot(root: string): this {
    this.where({ root: root });
    return this;
  }

  /**
   * Filter by minimum root index.
   *
   * @param minRootIndex - Minimum root index.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const recentRoots = await client.query().merkleRoots()
   * .byNetwork("base-sepolia")
   * .byPool("0x123...")
   * .withMinIndex(10)
   * .execute();
   * ```
   */
  withMinIndex(minRootIndex: number): this {
    this.where({ rootIndex_gte: minRootIndex });
    return this;
  }

  /**
   * Filter by maximum root index.
   *
   * @param maxRootIndex - Maximum root index.
   * @returns The current query builder instance for chaining.
   */
  withMaxIndex(maxRootIndex: number): this {
    this.where({ rootIndex_lte: maxRootIndex });
    return this;
  }

  /**
   * Filter by creation timestamp (after a given timestamp).
   *
   * @param timestamp - Unix timestamp string or number.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const recentRoots = await client.query().merkleRoots()
   * .byNetwork("base-sepolia")
   * .byPool("0x123...")
   * .createdAfter("1704067200") // 2024-01-01
   * .execute();
   * ```
   */
  createdAfter(timestamp: string | number): this {
    this.where({ createdAtTimestamp_gte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by creation timestamp (before a given timestamp).
   *
   * @param timestamp - Unix timestamp string or number.
   * @returns The current query builder instance for chaining.
   */
  createdBefore(timestamp: string | number): this {
    this.where({ createdAtTimestamp_lte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by block number.
   *
   * @param blockNumber - Block number.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const blockRoots = await client.query().merkleRoots()
   * .byNetwork("base-sepolia")
   * .atBlock("12345678")
   * .execute();
   * ```
   */
  atBlock(blockNumber: string | number): this {
    this.where({ createdAtBlock: blockNumber.toString() });
    return this;
  }

  /**
   * Filter by transaction hash.
   *
   * @param transaction - Transaction hash.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const txRoots = await client.query().merkleRoots()
   * .byNetwork("base-sepolia")
   * .inTransaction("0xabc...")
   * .execute();
   * ```
   */
  inTransaction(transaction: string): this {
    this.where({ createdAtTransaction: transaction });
    return this;
  }

  /**
   * ========================================
   * ORDERING METHODS
   * ========================================
   */

  /**
   * Order results by root index.
   *
   * @param direction - Sort direction, "desc" for newest first (default), "asc" for oldest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const latestRoots = await client.query().merkleRoots()
   * .byNetwork("base-sepolia")
   * .byPool("0x123...")
   * .orderByIndex()
   * .limit(10)
   * .execute();
   * ```
   */
  orderByIndex(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("rootIndex", direction);
    return this;
  }

  /**
   * Order results by creation timestamp.
   *
   * @param direction - Sort direction, "desc" for newest first (default), "asc" for oldest.
   * @returns The current query builder instance for chaining.
   */
  orderByCreation(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("createdAtTimestamp", direction);
    return this;
  }

  /**
   * Order results by block number.
   *
   * @param direction - Sort direction, "desc" for newest first (default), "asc" for oldest.
   * @returns The current query builder instance for chaining.
   */
  orderByBlock(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("createdAtBlock", direction);
    return this;
  }

  /**
   * Order results by root value.
   *
   * @param direction - Sort direction, "asc" for alphabetical (default), "desc" for reverse alphabetical.
   * @returns The current query builder instance for chaining.
   */
  orderByRoot(direction: "asc" | "desc" = "asc"): this {
    this.orderBy("root", direction);
    return this;
  }

  /**
   * ========================================
   * SPECIAL QUERIES / Convenience Helpers (using BaseQueryBuilder)
   * ========================================
   */

  /**
   * Get pool root history. This is essentially fetching all roots for a given pool, ordered by index.
   *
   * @param poolId - Pool ID.
   * @param network - Network identifier.
   * @returns Promise resolving to array of MerkleRoot entities in chronological order.
   */
  async getPoolRootHistory(
    poolId: string,
    network: NetworkName,
  ): Promise<MerkleRoot[]> {
    // Use the BaseQueryBuilder's capabilities
    return this.clone() // Clone to avoid modifying the current builder's state
      .byNetwork(network)
      .byPool(poolId)
      .orderByIndex("asc") // History is typically chronological
      .execute();
  }

  /**
   * Get valid root indices for a pool.
   * This method specifically fetches the `rootIndex`, `root`, and `createdAtTimestamp` fields.
   *
   * @param poolId - Pool ID.
   * @param network - Network identifier.
   * @returns Promise resolving to an array of objects containing root index information.
   */
  async getValidRootIndices(
    poolId: string,
    network: NetworkName,
  ): Promise<
    Array<{ rootIndex: number; root: string; createdAtTimestamp: string }>
  > {
    // This is a specific projection, so we might need to override the fields
    // temporarily or ensure the default fields include these.
    // For now, let's assume `execute` returns `MerkleRoot` and we map it.
    const roots = await this.clone()
      .byNetwork(network)
      .byPool(poolId)
      .orderByIndex("asc") // Order for consistency
      .execute(); // Execute with default fields

    // Map to the desired subset of fields
    return roots.map((r) => ({
      rootIndex: Number(r.rootIndex), // Ensure it's a number
      root: r.root.toString(),
      createdAtTimestamp: r.createdAtTimestamp.toString(),
    }));
  }

  /**
   * Find root index for a specific root value.
   *
   * @param poolId - Pool ID.
   * @param network - Network identifier.
   * @param root - Root value to find.
   * @returns Promise resolving to root index information or null.
   */
  async findRootIndex(
    poolId: string,
    network: NetworkName,
    root: string,
  ): Promise<{
    rootIndex: number;
    root: string;
    createdAtTimestamp: string;
  } | null> {
    const result = await this.clone()
      .byNetwork(network)
      .byPool(poolId)
      .byRoot(root)
      .first(); // Get only the first match

    if (result) {
      return {
        rootIndex: Number(result.rootIndex),
        root: result.root.toString(),
        createdAtTimestamp: result.createdAtTimestamp.toString(),
      };
    }
    return null;
  }

  /**
   * Check if a root is valid for a pool.
   *
   * @param poolId - Pool ID.
   * @param network - Network identifier.
   * @param root - Root value to check.
   * @returns Promise resolving to true if root is valid.
   */
  async isValidRoot(
    poolId: string,
    network: NetworkName,
    root: string,
  ): Promise<boolean> {
    const rootInfo = await this.findRootIndex(poolId, network, root);
    return rootInfo !== null;
  }

  /**
   * Get the latest root for a pool.
   *
   * @param poolId - Pool ID.
   * @param network - Network identifier.
   * @returns Promise resolving to the latest MerkleRoot or null.
   */
  async getLatestRoot(
    poolId: string,
    network: NetworkName,
  ): Promise<MerkleRoot | null> {
    return this.clone()
      .byNetwork(network)
      .byPool(poolId)
      .orderByIndex("desc") // Order by index descending to get the latest
      .first();
  }

  /**
   * Get the MerkleRoot at a specific index for a pool.
   *
   * @param poolId - Pool ID.
   * @param network - Network identifier.
   * @param rootIndex - Root index.
   * @returns Promise resolving to the MerkleRoot at the specified index or null.
   */
  async getRootAtIndex(
    poolId: string,
    network: NetworkName,
    rootIndex: number,
  ): Promise<MerkleRoot | null> {
    return this.clone()
      .byNetwork(network)
      .byPool(poolId)
      .atIndex(rootIndex)
      .first();
  }

  /**
   * Get a range of MerkleRoots for a pool, inclusive of start and end indices.
   *
   * @param poolId - Pool ID.
   * @param network - Network identifier.
   * @param startIndex - Start index (inclusive).
   * @param endIndex - End index (inclusive).
   * @returns Promise resolving to an array of MerkleRoot entities within the specified range.
   */
  async getRootRange(
    poolId: string,
    network: NetworkName,
    startIndex: number,
    endIndex: number,
  ): Promise<MerkleRoot[]> {
    return this.clone()
      .byNetwork(network)
      .byPool(poolId)
      .withMinIndex(startIndex)
      .withMaxIndex(endIndex)
      .orderByIndex("asc") // Order by index ascending to get them in order
      .execute();
  }

  /**
   * Get statistics about roots for a specific pool.
   * This method fetches all relevant roots and calculates derived metrics.
   *
   * @param poolId - Pool ID.
   * @param network - Network identifier.
   * @returns Promise resolving to root statistics.
   */
  async getRootStatistics(
    poolId: string,
    network: NetworkName,
  ): Promise<{
    totalRoots: number;
    latestIndex: number;
    oldestRoot: string;
    newestRoot: string;
    averageTimeBetweenRoots: number;
    rootCreationRate: number;
  }> {
    // Fetch all roots for the pool, ordered by timestamp for statistics calculation
    const roots = await this.clone()
      .byNetwork(network)
      .byPool(poolId)
      .orderByCreation("asc") // Essential for time-based calculations
      .execute();

    const totalRoots = roots.length;
    const latestIndex =
      totalRoots > 0
        ? Math.max(...roots.map((r) => Number(r.rootIndex ?? 0)))
        : 0;

    const first = roots[0];
    const last = roots[roots.length - 1];

    const oldestRoot = first?.root.toString() ?? "N/A";
    const newestRoot = last?.root.toString() ?? "N/A";

    // Calculate average time between roots
    let totalTimeDiff = 0;
    for (let i = 1; i < roots.length; i++) {
      const prev = roots[i - 1];
      const curr = roots[i];
      // Ensure timestamps are valid numbers before arithmetic
      if (
        !prev?.createdAtTimestamp ||
        !curr?.createdAtTimestamp ||
        isNaN(Number(prev.createdAtTimestamp)) ||
        isNaN(Number(curr.createdAtTimestamp))
      ) {
        continue;
      }

      const diff =
        Number(curr.createdAtTimestamp) - Number(prev.createdAtTimestamp);
      totalTimeDiff += diff;
    }

    const averageTimeBetweenRoots =
      roots.length > 1 ? totalTimeDiff / (roots.length - 1) : 0;

    // Calculate root creation rate (roots per day)
    const timeSpan =
      first?.createdAtTimestamp && last?.createdAtTimestamp
        ? Number(last.createdAtTimestamp) - Number(first.createdAtTimestamp)
        : 0; // in seconds

    // 86400 seconds in a day
    const rootCreationRate = timeSpan > 0 ? (totalRoots / timeSpan) * 86400 : 0;

    return {
      totalRoots,
      latestIndex,
      oldestRoot,
      newestRoot,
      averageTimeBetweenRoots: Math.round(averageTimeBetweenRoots), // Round to nearest second
      rootCreationRate: Math.round(rootCreationRate * 100) / 100, // Round to 2 decimal places
    };
  }
}

/**
 * ========================================
 * CONVENIENCE FUNCTIONS (Updated to use new MerkleRootQueryBuilder)
 * ========================================
 */

/**
 * Get pool root history for a given pool and network.
 *
 * @param client - The SubgraphClient instance.
 * @param poolId - The ID of the pool.
 * @param network - The network identifier.
 * @returns A promise resolving to an array of MerkleRoot entities.
 *
 * @example
 * ```typescript
 * const roots = await getPoolRootHistory(client, "0x123...", "base-sepolia");
 * roots.forEach(root => console.log(`Root Index: ${root.rootIndex}, Root: ${root.root}`));
 * ```
 */
export async function getPoolRootHistory(
  client: SubgraphClient,
  poolId: string,
  network: NetworkName,
): Promise<MerkleRoot[]> {
  return new MerkleRootQueryBuilder(client).getPoolRootHistory(poolId, network);
}

/**
 * Get valid root indices for a pool.
 *
 * @param client - The SubgraphClient instance.
 * @param poolId - The ID of the pool.
 * @param network - The network identifier.
 * @returns A promise resolving to an array of objects containing root index, root, and creation timestamp.
 *
 * @example
 * ```typescript
 * const validIndices = await getValidRootIndices(client, "0x123...", "base-sepolia");
 * validIndices.forEach(idx => console.log(`Index: ${idx.rootIndex}, Root: ${idx.root}`));
 * ```
 */
export async function getValidRootIndices(
  client: SubgraphClient,
  poolId: string,
  network: NetworkName,
): Promise<
  Array<{ rootIndex: number; root: string; createdAtTimestamp: string }>
> {
  return new MerkleRootQueryBuilder(client).getValidRootIndices(
    poolId,
    network,
  );
}

/**
 * Find the root index for a specific root value within a given pool and network.
 *
 * @param client - The SubgraphClient instance.
 * @param poolId - The ID of the pool.
 * @param network - The network identifier.
 * @param root - The Merkle root value to find.
 * @returns A promise resolving to an object with root index information or null if not found.
 *
 * @example
 * ```typescript
 * const rootInfo = await findRootIndex(client, "0x123...", "base-sepolia", "0xabc...");
 * if (rootInfo) {
 * console.log(`Found root at index ${rootInfo.rootIndex}`);
 * }
 * ```
 */
export async function findRootIndex(
  client: SubgraphClient,
  poolId: string,
  network: NetworkName,
  root: string,
): Promise<{
  rootIndex: number;
  root: string;
  createdAtTimestamp: string;
} | null> {
  return new MerkleRootQueryBuilder(client).findRootIndex(
    poolId,
    network,
    root,
  );
}

/**
 * Check if a given Merkle root is valid for a specific pool and network.
 *
 * @param client - The SubgraphClient instance.
 * @param poolId - The ID of the pool.
 * @param network - The network identifier.
 * @param root - The Merkle root value to validate.
 * @returns A promise resolving to `true` if the root is valid, `false` otherwise.
 *
 * @example
 * ```typescript
 * const isValid = await isValidRoot(client, "0x123...", "base-sepolia", "0xabc...");
 * console.log(`Is root valid: ${isValid}`);
 * ```
 */
export async function isValidRoot(
  client: SubgraphClient,
  poolId: string,
  network: NetworkName,
  root: string,
): Promise<boolean> {
  return new MerkleRootQueryBuilder(client).isValidRoot(poolId, network, root);
}

/**
 * Get the latest Merkle root for a specific pool and network.
 *
 * @param client - The SubgraphClient instance.
 * @param poolId - The ID of the pool.
 * @param network - The network identifier.
 * @returns A promise resolving to the latest MerkleRoot entity or `null` if no roots are found.
 *
 * @example
 * ```typescript
 * const latest = await getLatestRoot(client, "0x123...", "base-sepolia");
 * if (latest) {
 * console.log(`Latest root index: ${latest.rootIndex}, Root: ${latest.root}`);
 * }
 * ```
 */
export async function getLatestRoot(
  client: SubgraphClient,
  poolId: string,
  network: NetworkName,
): Promise<MerkleRoot | null> {
  return new MerkleRootQueryBuilder(client).getLatestRoot(poolId, network);
}

/**
 * Get the Merkle root at a specific index for a given pool and network.
 *
 * @param client - The SubgraphClient instance.
 * @param poolId - The ID of the pool.
 * @param network - The network identifier.
 * @param rootIndex - The specific root index to retrieve.
 * @returns A promise resolving to the MerkleRoot entity at the specified index or `null` if not found.
 *
 * @example
 * ```typescript
 * const root5 = await getRootAtIndex(client, "0x123...", "base-sepolia", 5);
 * if (root5) {
 * console.log(`Root at index 5: ${root5.root}`);
 * }
 * ```
 */
export async function getRootAtIndex(
  client: SubgraphClient,
  poolId: string,
  network: NetworkName,
  rootIndex: number,
): Promise<MerkleRoot | null> {
  return new MerkleRootQueryBuilder(client).getRootAtIndex(
    poolId,
    network,
    rootIndex,
  );
}
