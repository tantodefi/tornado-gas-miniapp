/**
 * Query builder for UserOperation entities
 * Updated for the new network-aware schema structure
 */

import type { SubgraphClient } from "../../client/subgraph-client.js";
import type {
  UserOperation,
  NetworkName,
  PaymasterType,
} from "../../types/subgraph.js";

import { UserOperationFields, UserOperationWhereInput } from "../types.js";
import { BaseQueryBuilder } from "./base-query-builder.js";

// Define specific types for UserOperationQueryBuilder
export type UserOperationOrderBy =
  | "executedAtTimestamp"
  | "actualGasCost"
  | "gasPrice"
  | "totalGasUsed"
  | "executedAtBlock"
  | "sender";

/**
 * Query builder for UserOperation entities
 *
 * Provides a fluent interface for building complex user operation queries
 * with support for paymaster filtering, gas analysis, and transaction tracking.
 */
export class UserOperationQueryBuilder extends BaseQueryBuilder<
  UserOperation,
  UserOperationFields,
  UserOperationWhereInput,
  UserOperationOrderBy
> {
  constructor(private subgraphClient: SubgraphClient) {
    super(subgraphClient, "userOperations", "executedAtTimestamp", "desc");
  }
  /**
   * Override default fields for UserOperation entity.
   */
  protected getDefaultFields(): string {
    return `
      id
      userOpHash
      sender
      nonce
      initCode
      callData
      callGasLimit
      verificationGasLimit
      preVerificationGas
      maxFeePerGas
      maxPriorityFeePerGas
      paymasterAndData
      signature
      actualGasCost
      actualGasPrice
      success
      chainId
      network
      executedAtBlock
      executedAtTransaction
      executedAtTimestamp
      totalGasUsed
      gasPrice
      aggregator
      bundler
      factory
      nullifier
      paymaster {
        id
        address
        contractType
      }
      pool {
        id
        poolId
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
   * @returns UserOperationQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const userOps = await client.query().userOperations()
   *   .byNetwork("base-sepolia")
   *   .execute();
   * ```
   */
  byNetwork(network: NetworkName): this {
    this.where({ network: network });
    return this;
  }

  /**
   * Filter by user operation hash
   *
   * @param userOpHash - User operation hash
   * @returns UserOperationQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const userOp = await client.query().userOperations()
   *   .byNetwork("base-sepolia")
   *   .byHash("0x123...")
   *   .first();
   * ```
   */
  byHash(userOpHash: string): this {
    this.where({ userOpHash: userOpHash });
    return this;
  }

  /**
   * Filter by composite ID (network-userOpHash)
   * This is for direct lookup of a single user operation.
   *
   * @param network - Network identifier
   * @param userOpHash - User operation hash
   * @returns UserOperationQueryBuilder for method chaining
   */
  byId(network: NetworkName, userOpHash: string): this {
    this.where({ id: `${network}-${userOpHash}` });
    this.byNetwork(network);
    this.byHash(userOpHash);
    return this;
  }

  /**
   * Filter by paymaster address
   *
   * @param paymaster - Paymaster contract address
   * @returns UserOperationQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const paymasterOps = await client.query().userOperations()
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
   * Filter by paymaster type
   *
   * @param type - Paymaster type
   * @returns UserOperationQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const gasLimitedOps = await client.query().userOperations()
   *   .byNetwork("base-sepolia")
   *   .byPaymasterType("GasLimited")
   *   .execute();
   * ```
   */
  byPaymasterType(type: PaymasterType): this {
    this.where({ paymaster_: { contractType: type } });
    return this;
  }

  /**
   * Filter by pool ID
   *
   * @param poolId - Pool ID
   * @returns UserOperationQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const poolOps = await client.query().userOperations()
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
   * Filter by sender address
   *
   * @param sender - Sender address
   * @returns UserOperationQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const userOps = await client.query().userOperations()
   *   .byNetwork("base-sepolia")
   *   .bySender("0x456...")
   *   .execute();
   * ```
   */
  bySender(sender: string): this {
    this.where({ sender: sender });
    return this;
  }

  /**
   * Filter by nullifier
   *
   * @param nullifier - Nullifier value
   * @returns UserOperationQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const nullifierOps = await client.query().userOperations()
   *   .byNetwork("base-sepolia")
   *   .byNullifier("0x789...")
   *   .execute();
   * ```
   */
  byNullifier(nullifier: string): this {
    this.where({ nullifier: nullifier });
    return this;
  }

  /**
   * Filter by minimum gas cost
   *
   * @param minGasCost - Minimum gas cost in wei (as string)
   * @returns UserOperationQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const expensiveOps = await client.query().userOperations()
   *   .byNetwork("base-sepolia")
   *   .withMinGasCost("1000000000000000000") // 1 ETH
   *   .execute();
   * ```
   */
  withMinGasCost(minGasCost: string): this {
    this.where({ actualGasCost_gte: minGasCost });
    return this;
  }

  /**
   * Filter by maximum gas cost
   *
   * @param maxGasCost - Maximum gas cost in wei (as string)
   * @returns UserOperationQueryBuilder for method chaining
   */
  withMaxGasCost(maxGasCost: string): this {
    this.where({ actualGasCost_lte: maxGasCost });
    return this;
  }

  /**
   * Filter by minimum gas price
   *
   * @param minGasPrice - Minimum gas price in wei (as string)
   * @returns UserOperationQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const highGasPriceOps = await client.query().userOperations()
   *   .byNetwork("base-sepolia")
   *   .withMinGasPrice("20000000000") // 20 gwei
   *   .execute();
   * ```
   */
  withMinGasPrice(minGasPrice: string): this {
    this.where({ gasPrice_gte: minGasPrice });
    return this;
  }

  /**
   * Filter by maximum gas price
   *
   * @param maxGasPrice - Maximum gas price in wei (as string)
   * @returns UserOperationQueryBuilder for method chaining
   */
  withMaxGasPrice(maxGasPrice: string): this {
    this.where({ gasPrice_lte: maxGasPrice });
    return this;
  }

  /**
   * Filter by execution date (after)
   *
   * @param timestamp - Timestamp string or number
   * @returns UserOperationQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const recentOps = await client.query().userOperations()
   *   .byNetwork("base-sepolia")
   *   .executedAfter("1704067200") // 2024-01-01
   *   .execute();
   * ```
   */
  executedAfter(timestamp: string | number): this {
    this.where({ executedAtTimestamp_gte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by execution date (before)
   *
   * @param timestamp - Timestamp string or number
   * @returns UserOperationQueryBuilder for method chaining
   */
  executedBefore(timestamp: string | number): this {
    this.where({ executedAtTimestamp_lte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by block number
   *
   * @param blockNumber - Block number
   * @returns UserOperationQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const blockOps = await client.query().userOperations()
   *   .byNetwork("base-sepolia")
   *   .atBlock("12345678")
   *   .execute();
   * ```
   */
  atBlock(blockNumber: string | number): this {
    this.where({ executedAtBlock: blockNumber.toString() });
    return this;
  }

  /**
   * Filter by transaction hash
   *
   * @param transaction - Transaction hash
   * @returns UserOperationQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const txOps = await client.query().userOperations()
   *   .byNetwork("base-sepolia")
   *   .inTransaction("0xabc...")
   *   .execute();
   * ```
   */
  inTransaction(transaction: string): this {
    this.where({ transactionHash: transaction });
    return this;
  }

  /**
   * ========================================
   * ORDERING METHODS
   * ========================================
   */

  /**
   * Order by execution timestamp (newest first)
   *
   * @returns UserOperationQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const recentOps = await client.query().userOperations()
   *   .byNetwork("base-sepolia")
   *   .orderByTimestamp()
   *   .limit(10)
   *   .execute();
   * ```
   */
  orderByTimestamp(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("executedAtTimestamp", direction);
    return this;
  }

  /**
   * Order by gas cost (highest first)
   *
   * @returns UserOperationQueryBuilder for method chaining
   */
  orderByGasCost(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("actualGasCost", direction);
    return this;
  }

  /**
   * Order by gas price (highest first)
   *
   * @returns UserOperationQueryBuilder for method chaining
   */
  orderByGasPrice(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("gasPrice", direction);
    return this;
  }

  /**
   * Order by total gas used
   *
   * @returns UserOperationQueryBuilder for method chaining
   */
  orderByGasUsed(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalGasUsed", direction);
    return this;
  }

  /**
   * Order by block number
   *
   * @returns UserOperationQueryBuilder for method chaining
   */
  orderByBlock(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("executedAtBlock", direction);
    return this;
  }

  /**
   * Order by sender address
   *
   * @returns UserOperationQueryBuilder for method chaining
   */
  orderBySender(direction: "asc" | "desc" = "asc"): this {
    this.orderBy("sender", direction);
    return this;
  }

  /**
   * ========================================
   * SPECIAL QUERIES
   * ========================================
   */

  /**
   * Get user operation by hash
   *
   * @param userOpHash - User operation hash
   * @param network - Network identifier
   * @returns Promise resolving to user operation or null
   */
  async getUserOperationByHash(
    userOpHash: string,
    network: NetworkName,
  ): Promise<UserOperation | null> {
    return this.clone().byId(network, userOpHash).first();
  }

  /**
   * Get gas statistics for user operations
   *
   * @returns Promise resolving to gas statistics
   */
  async getGasStatistics(): Promise<{
    totalOperations: number;
    totalGasCost: string;
    totalGasUsed: string;
    averageGasCost: string;
    averageGasUsed: string;
    averageGasPrice: string;
    minGasCost: string;
    maxGasCost: string;
    medianGasCost: string;
  }> {
    const operations = await this.execute();

    const totalOperations = operations.length;
    const totalGasCost = operations.reduce(
      (sum, op) => sum + BigInt(op.actualGasCost),
      0n,
    );
    const totalGasUsed = operations.reduce(
      (sum, op) => sum + (op.totalGasUsed ? BigInt(op.totalGasUsed) : 0n),
      0n,
    );

    const averageGasCost =
      totalOperations > 0 ? totalGasCost / BigInt(totalOperations) : 0n;
    const averageGasUsed =
      totalOperations > 0 ? totalGasUsed / BigInt(totalOperations) : 0n;

    // Calculate average gas price
    const totalGasPrice = operations.reduce(
      (sum, op) => sum + (op.gasPrice ? BigInt(op.gasPrice) : 0n),
      0n,
    );
    const averageGasPrice =
      totalOperations > 0 ? totalGasPrice / BigInt(totalOperations) : 0n;

    // Find min and max gas costs
    const gasCosts = operations.map((op) => BigInt(op.actualGasCost));
    const minGasCost =
      gasCosts.length > 0
        ? gasCosts.reduce((min, cost) => (cost < min ? cost : min))
        : 0n;
    const maxGasCost =
      gasCosts.length > 0
        ? gasCosts.reduce((max, cost) => (cost > max ? cost : max))
        : 0n;

    // Calculate median gas cost
    const sortedGasCosts = gasCosts.sort((a, b) =>
      a < b ? -1 : a > b ? 1 : 0,
    );
    const medianGasCost =
      sortedGasCosts.length > 0
        ? sortedGasCosts[Math.floor(sortedGasCosts.length / 2)]
        : 0n;

    return {
      totalOperations,
      totalGasCost: totalGasCost.toString(),
      totalGasUsed: totalGasUsed.toString(),
      averageGasCost: averageGasCost.toString(),
      averageGasUsed: averageGasUsed.toString(),
      averageGasPrice: averageGasPrice.toString(),
      minGasCost: minGasCost.toString(),
      maxGasCost: maxGasCost.toString(),
      medianGasCost: medianGasCost?.toString() ?? "0",
    };
  }

  /**
   * Get user operation timeline
   *
   * @param days - Number of days to look back
   * @returns Promise resolving to daily operation counts
   */
  async getOperationTimeline(days: number = 30): Promise<
    Array<{
      date: string;
      operations: number;
      totalGasCost: string;
      averageGasCost: string;
      uniqueSenders: number;
    }>
  > {
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - days * 24 * 60 * 60;

    const operations = await this.executedAfter(startTime)
      .orderByTimestamp("asc")
      .execute();

    // Group by date
    const timeline: Record<
      string,
      {
        operations: number;
        totalGasCost: bigint;
        senders: Set<string>;
      }
    > = {};

    for (const op of operations) {
      const date = new Date(Number(op.executedAtTimestamp) * 1000)
        .toISOString()
        .split("T")[0]!;

      if (!timeline[date]) {
        timeline[date] = {
          operations: 0,
          totalGasCost: 0n,
          senders: new Set(),
        };
      }

      timeline[date].operations += 1;
      timeline[date].totalGasCost += BigInt(op.actualGasCost);
      timeline[date].senders.add(op.sender);
    }

    return Object.entries(timeline).map(([date, stats]) => ({
      date,
      operations: stats.operations,
      totalGasCost: stats.totalGasCost.toString(),
      averageGasCost:
        stats.operations > 0
          ? (stats.totalGasCost / BigInt(stats.operations)).toString()
          : "0",
      uniqueSenders: stats.senders.size,
    }));
  }

  /**
   * Get sender analysis
   *
   * @returns Promise resolving to sender statistics
   */
  async getSenderAnalysis(): Promise<
    Array<{
      sender: string;
      operationCount: number;
      totalGasCost: string;
      averageGasCost: string;
      firstOperation: string;
      lastOperation: string;
    }>
  > {
    const operations = await this.execute();

    // Group by sender
    const senderStats: Record<
      string,
      {
        operationCount: number;
        totalGasCost: bigint;
        timestamps: number[];
      }
    > = {};

    for (const op of operations) {
      // Ensure the sender entry exists, initializing if not
      const currentSenderStats = senderStats[op.sender] || {
        operationCount: 0,
        totalGasCost: 0n,
        timestamps: [],
      };

      currentSenderStats.operationCount += 1;
      currentSenderStats.totalGasCost += BigInt(op.actualGasCost);
      // Ensure the timestamp is valid before pushing
      const timestamp = Number(op.executedAtTimestamp);
      if (!isNaN(timestamp)) {
        // Only add if it's a valid number
        currentSenderStats.timestamps.push(timestamp);
      }

      // Assign back the potentially updated object (important if it was newly initialized)
      senderStats[op.sender] = currentSenderStats;
    }

    return Object.entries(senderStats)
      .map(([sender, stats]) => {
        // Fix for "Object is possibly 'undefined'" error on sortedTimestamps,
        // adding a nullish coalescing operator just in case stats.timestamps
        // somehow became null/undefined, though logic suggests it should not.
        const sortedTimestamps = (stats.timestamps ?? []).sort((a, b) => a - b);
        const averageGasCost =
          stats.operationCount > 0
            ? stats.totalGasCost / BigInt(stats.operationCount)
            : 0n;

        return {
          sender,
          operationCount: stats.operationCount,
          totalGasCost: stats.totalGasCost.toString(),
          averageGasCost: averageGasCost.toString(),
          firstOperation:
            sortedTimestamps.length > 0
              ? (sortedTimestamps[0]?.toString() ?? "0")
              : "0",
          lastOperation:
            sortedTimestamps.length > 0
              ? (sortedTimestamps[sortedTimestamps.length - 1]?.toString() ??
                "0")
              : "0",
        };
      })
      .sort((a, b) => b.operationCount - a.operationCount);
  }
}

/**
 * ========================================
 * CONVENIENCE FUNCTIONS (updated to use new UserOperationQueryBuilder)
 * ========================================
 */

/**
 * Get user operation by hash
 *
 * @param client - SubgraphClient instance
 * @param userOpHash - User operation hash
 * @param network - Network identifier
 * @returns Promise resolving to user operation or null
 */
export async function getUserOperationByHash(
  client: SubgraphClient,
  userOpHash: string,
  network: NetworkName,
): Promise<UserOperation | null> {
  return new UserOperationQueryBuilder(client).getUserOperationByHash(
    userOpHash,
    network,
  );
}

/**
 * Get recent user operations
 *
 * @param client - SubgraphClient instance
 * @param network - Network identifier
 * @param limit - Maximum number of results
 * @returns Promise resolving to array of recent user operations
 */
export async function getRecentUserOperations(
  client: SubgraphClient,
  network: NetworkName,
  limit: number = 10,
): Promise<UserOperation[]> {
  return new UserOperationQueryBuilder(client)
    .byNetwork(network)
    .orderByTimestamp()
    .limit(limit)
    .execute();
}

/**
 * Get user operations by sender
 *
 * @param client - SubgraphClient instance
 * @param sender - Sender address
 * @param network - Network identifier
 * @returns Promise resolving to array of user operations
 */
export async function getUserOperationsBySender(
  client: SubgraphClient,
  sender: string,
  network: NetworkName,
): Promise<UserOperation[]> {
  return new UserOperationQueryBuilder(client)
    .byNetwork(network)
    .bySender(sender)
    .orderByTimestamp()
    .execute();
}

/**
 * Get user operations by paymaster
 *
 * @param client - SubgraphClient instance
 * @param paymaster - Paymaster contract address
 * @param network - Network identifier
 * @returns Promise resolving to array of user operations
 */
export async function getUserOperationsByPaymaster(
  client: SubgraphClient,
  paymaster: string,
  network: NetworkName,
): Promise<UserOperation[]> {
  return new UserOperationQueryBuilder(client)
    .byNetwork(network)
    .byPaymaster(paymaster)
    .orderByTimestamp()
    .execute();
}

/**
 * Get expensive user operations (high gas cost)
 *
 * @param client - SubgraphClient instance
 * @param network - Network identifier
 * @param minGasCost - Minimum gas cost threshold
 * @param limit - Maximum number of results
 * @returns Promise resolving to array of expensive user operations
 */
export async function getExpensiveUserOperations(
  client: SubgraphClient,
  network: NetworkName,
  minGasCost: string,
  limit: number = 10,
): Promise<UserOperation[]> {
  return new UserOperationQueryBuilder(client)
    .byNetwork(network)
    .withMinGasCost(minGasCost)
    .orderByGasCost()
    .limit(limit)
    .execute();
}
