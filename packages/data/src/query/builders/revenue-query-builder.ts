// revenue-withdrawal-query-builder.ts

import type { SubgraphClient } from "../../client/subgraph-client.js";
import type {
  RevenueWithdrawal,
  NetworkName,
  PaymasterType,
} from "../../types/subgraph.js";
import {
  RevenueWithdrawalFields,
  RevenueWithdrawalWhereInput,
} from "../types.js";
import { BaseQueryBuilder } from "./base-query-builder.js";

export type RevenueWithdrawalOrderBy =
  | "withdrawnAtTimestamp"
  | "amount"
  | "withdrawnAtBlock"
  | "recipient";

/**
 * Query builder for RevenueWithdrawal entities
 *
 * Provides a fluent interface for building revenue withdrawal queries
 * with support for paymaster filtering, amount analysis, and recipient tracking.
 */
export class RevenueWithdrawalQueryBuilder extends BaseQueryBuilder<
  RevenueWithdrawal,
  RevenueWithdrawalFields,
  RevenueWithdrawalWhereInput,
  RevenueWithdrawalOrderBy
> {
  constructor(private subgraphClient: SubgraphClient) {
    super(subgraphClient, "revenueWithdrawals", "withdrawnAtTimestamp", "desc");
  }

  /**
   * Override default fields for RevenueWithdrawal entity.
   */
  protected getDefaultFields(): string {
    return `
      id
      amount
      network
      chainId
      recipient
      withdrawnAtBlock
      withdrawnAtTransaction
      withdrawnAtTimestamp
      paymaster {
        id
        address
        contractType
        network
      }
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
   * const withdrawals = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .execute();
   * ```
   */
  byNetwork(network: NetworkName): this {
    this.where({ network: network });
    return this;
  }

  /**
   * Filter by paymaster address.
   *
   * @param paymasterAddress - Paymaster contract address (e.g., "0x3BEeC075aC5A77fFE0F9ee4bbb3DCBd07fA93fbf").
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const paymasterWithdrawals = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .byPaymaster("0x3BEeC075aC5A77fFE0F9ee4bbb3DCBd07fA93fbf")
   * .execute();
   * ```
   */
  byPaymaster(paymasterAddress: string): this {
    this.where({ paymaster_: { address: paymasterAddress } });
    return this;
  }

  /**
   * Filter by paymaster type.
   *
   * @param type - Paymaster type (e.g., "GasLimited").
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const gasLimitedWithdrawals = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .byPaymasterType("GasLimited")
   * .execute();
   * ```
   */
  byPaymasterType(type: PaymasterType): this {
    this.where({ paymaster_: { contractType: type } });
    return this;
  }

  /**
   * Filter by recipient address.
   *
   * @param recipientAddress - Recipient address (e.g., "0x456...").
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const userWithdrawals = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .byRecipient("0x456...")
   * .execute();
   * ```
   */
  byRecipient(recipientAddress: string): this {
    this.where({ recipient: recipientAddress });
    return this;
  }

  /**
   * Filter by minimum withdrawal amount.
   *
   * @param minAmount - Minimum amount in wei (as string) (e.g., "1000000000000000000" for 1 ETH).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const largeWithdrawals = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .withMinAmount("1000000000000000000") // 1 ETH
   * .execute();
   * ```
   */
  withMinAmount(minAmount: string): this {
    this.where({ amount_gte: minAmount });
    return this;
  }

  /**
   * Filter by maximum withdrawal amount.
   *
   * @param maxAmount - Maximum amount in wei (as string).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const smallWithdrawals = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .withMaxAmount("10000000000000000") // 0.01 ETH
   * .execute();
   * ```
   */
  withMaxAmount(maxAmount: string): this {
    this.where({ amount_lte: maxAmount });
    return this;
  }

  /**
   * Filter by withdrawal date (after a specific timestamp).
   *
   * @param timestamp - Timestamp string or number (e.g., "1704067200" for 2024-01-01).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const recentWithdrawals = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .withdrawnAfter("1704067200") // 2024-01-01
   * .execute();
   * ```
   */
  withdrawnAfter(timestamp: string | number): this {
    this.where({ withdrawnAtTimestamp_gte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by withdrawal date (before a specific timestamp).
   *
   * @param timestamp - Timestamp string or number.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const oldWithdrawals = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .withdrawnBefore("1672531200") // 2023-01-01
   * .execute();
   * ```
   */
  withdrawnBefore(timestamp: string | number): this {
    this.where({ withdrawnAtTimestamp_lte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by block number.
   *
   * @param blockNumber - Block number (e.g., "12345678").
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const blockWithdrawals = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .atBlock("12345678")
   * .execute();
   * ```
   */
  atBlock(blockNumber: string | number): this {
    this.where({ withdrawnAtBlock: blockNumber.toString() });
    return this;
  }

  /**
   * Filter by transaction hash.
   *
   * @param transactionHash - Transaction hash (e.g., "0xabc...").
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const txWithdrawals = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .inTransaction("0xabc...")
   * .execute();
   * ```
   */
  inTransaction(transactionHash: string): this {
    this.where({ transactionHash: transactionHash });
    return this;
  }

  /**
   * ========================================
   * ORDERING METHODS (Convenience methods, inherited from BaseQueryBuilder)
   * ========================================
   */

  /**
   * Order results by withdrawal timestamp.
   *
   * @param direction - Sort direction, "desc" for newest first (default), "asc" for oldest first.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const recentWithdrawals = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .orderByTimestamp()
   * .limit(10)
   * .execute();
   * ```
   */
  orderByTimestamp(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("withdrawnAtTimestamp", direction);
    return this;
  }

  /**
   * Order results by withdrawal amount.
   *
   * @param direction - Sort direction, "desc" for largest first (default), "asc" for smallest first.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const largestWithdrawals = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .orderByAmount("desc")
   * .limit(5)
   * .execute();
   * ```
   */
  orderByAmount(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("amount", direction);
    return this;
  }

  /**
   * Order results by block number.
   *
   * @param direction - Sort direction, "desc" for newest block first (default), "asc" for oldest block first.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const withdrawalsByBlock = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .orderByBlock("asc")
   * .limit(20)
   * .execute();
   * ```
   */
  orderByBlock(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("withdrawnAtBlock", direction);
    return this;
  }

  /**
   * Order results by recipient address.
   *
   * @param direction - Sort direction, "asc" for A-Z (default), "desc" for Z-A.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const withdrawalsByRecipient = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .orderByRecipient("asc")
   * .limit(10)
   * .execute();
   * ```
   */
  orderByRecipient(direction: "asc" | "desc" = "asc"): this {
    this.orderBy("recipient", direction);
    return this;
  }

  /**
   * ========================================
   * ANALYTICS METHODS
   * ========================================
   */

  /**
   * Get overall withdrawal statistics based on the current query configuration.
   * Includes total withdrawals, amounts, averages, min/max/median, unique recipients/paymasters, and frequency.
   *
   * @returns A promise resolving to an object containing various withdrawal statistics.
   *
   * @example
   * ```typescript
   * const stats = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .withdrawnAfter(Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60) // Last 7 days
   * .getWithdrawalStatistics();
   * console.log(stats);
   * ```
   */
  async getWithdrawalStatistics(): Promise<{
    totalWithdrawals: number;
    totalAmount: string;
    averageAmount: string;
    minAmount: string;
    maxAmount: string;
    medianAmount: string;
    uniqueRecipients: number;
    uniquePaymasters: number;
    withdrawalFrequency: number;
  }> {
    const withdrawals = await this.execute();

    const totalWithdrawals = withdrawals.length;
    const totalAmount = withdrawals.reduce(
      (sum, w) => sum + BigInt(w.amount ?? 0),
      0n,
    );
    const averageAmount =
      totalWithdrawals > 0 ? totalAmount / BigInt(totalWithdrawals) : 0n;

    const amounts = withdrawals.map((w) => BigInt(w.amount ?? 0));
    const minAmount = amounts.length
      ? amounts.reduce((min, val) => (val < min ? val : min))
      : 0n;
    const maxAmount = amounts.length
      ? amounts.reduce((max, val) => (val > max ? val : max))
      : 0n;

    const sortedAmounts = [...amounts].sort((a, b) => (a < b ? -1 : 1));
    const medianIndex = Math.floor(sortedAmounts.length / 2);
    const medianAmount = sortedAmounts[medianIndex] ?? 0n;

    const uniqueRecipients = new Set(
      withdrawals.map((w) => w.recipient).filter(Boolean),
    ).size;

    const uniquePaymasters = new Set(
      withdrawals.map((w) => w.paymaster?.id).filter(Boolean),
    ).size;

    const timestamps = withdrawals
      .map((w) => Number(w.withdrawnAtTimestamp))
      .filter(Boolean);

    const timeSpan =
      timestamps.length > 1
        ? Math.max(...timestamps) - Math.min(...timestamps)
        : 0;

    // Calculate frequency per day
    const withdrawalFrequency =
      timeSpan > 0 ? (totalWithdrawals / timeSpan) * 86400 : 0;

    return {
      totalWithdrawals,
      totalAmount: totalAmount.toString(),
      averageAmount: averageAmount.toString(),
      minAmount: minAmount.toString(),
      maxAmount: maxAmount.toString(),
      medianAmount: medianAmount.toString(),
      uniqueRecipients,
      uniquePaymasters,
      withdrawalFrequency: Math.round(withdrawalFrequency * 100) / 100,
    };
  }

  /**
   * Get a timeline of revenue withdrawals, aggregated by day.
   *
   * @param days - The number of days to look back for the timeline (default is 30).
   * @returns A promise resolving to an array of daily withdrawal statistics.
   *
   * @example
   * ```typescript
   * const timeline = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .getWithdrawalTimeline(7); // Get timeline for the last 7 days
   * console.log(timeline);
   * ```
   */
  async getWithdrawalTimeline(days: number = 30): Promise<
    Array<{
      date: string;
      withdrawals: number;
      totalAmount: string;
      averageAmount: string;
      uniqueRecipients: number;
      uniquePaymasters: number;
    }>
  > {
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - days * 24 * 60 * 60;

    const withdrawals = await this.clone()
      .withdrawnAfter(startTime)
      .orderByTimestamp("asc")
      .execute();

    const timeline: Record<
      string,
      {
        withdrawals: number;
        totalAmount: bigint;
        recipients: Set<string>;
        paymasters: Set<string>;
      }
    > = {};

    for (const w of withdrawals) {
      const ts = Number(w.withdrawnAtTimestamp);
      if (!Number.isFinite(ts) || ts <= 0) continue;

      const date = new Date(ts * 1000).toISOString().split("T")[0]!;

      if (!timeline[date]) {
        timeline[date] = {
          withdrawals: 0,
          totalAmount: 0n,
          recipients: new Set(),
          paymasters: new Set(),
        };
      }

      timeline[date].withdrawals += 1;
      timeline[date].totalAmount += BigInt(w.amount ?? 0);
      if (w.recipient) timeline[date].recipients.add(w.recipient);
      if (w.paymaster?.id) timeline[date].paymasters.add(w.paymaster.id);
    }

    return Object.entries(timeline).map(([date, stats]) => ({
      date,
      withdrawals: stats.withdrawals,
      totalAmount: stats.totalAmount.toString(),
      averageAmount:
        stats.withdrawals > 0
          ? (stats.totalAmount / BigInt(stats.withdrawals)).toString()
          : "0",
      uniqueRecipients: stats.recipients.size,
      uniquePaymasters: stats.paymasters.size,
    }));
  }

  /**
   * Analyze withdrawal patterns by recipient.
   * Provides statistics for each recipient including withdrawal count, total/average amount,
   * first/last withdrawal timestamps, and the number of distinct paymasters they received from.
   *
   * @returns A promise resolving to an array of recipient analysis objects.
   *
   * @example
   * ```typescript
   * const recipientStats = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .getRecipientAnalysis();
   * console.log(recipientStats[0]); // { recipient: "...", withdrawalCount: ..., totalAmount: "..." }
   * ```
   */
  async getRecipientAnalysis(): Promise<
    Array<{
      recipient: string;
      withdrawalCount: number;
      totalAmount: string;
      averageAmount: string;
      firstWithdrawal: string;
      lastWithdrawal: string;
      paymasterCount: number;
    }>
  > {
    const withdrawals = await this.execute();

    const recipientStats: Record<
      string,
      {
        withdrawalCount: number;
        totalAmount: bigint;
        timestamps: number[];
        paymasters: Set<string>;
      }
    > = {};

    for (const w of withdrawals) {
      const recipient = w.recipient;
      if (!recipient) continue;

      if (!recipientStats[recipient]) {
        recipientStats[recipient] = {
          withdrawalCount: 0,
          totalAmount: 0n,
          timestamps: [],
          paymasters: new Set(),
        };
      }

      recipientStats[recipient].withdrawalCount += 1;
      recipientStats[recipient].totalAmount += BigInt(w.amount ?? 0);
      recipientStats[recipient].timestamps.push(
        Number(w.withdrawnAtTimestamp ?? 0),
      );
      if (w.paymaster?.id)
        recipientStats[recipient].paymasters.add(w.paymaster.id);
    }

    return Object.entries(recipientStats)
      .map(([recipient, stats]) => {
        const sortedTimestamps = [...stats.timestamps].sort((a, b) => a - b);
        const averageAmount =
          stats.withdrawalCount > 0
            ? stats.totalAmount / BigInt(stats.withdrawalCount)
            : 0n;

        return {
          recipient,
          withdrawalCount: stats.withdrawalCount,
          totalAmount: stats.totalAmount.toString(),
          averageAmount: averageAmount.toString(),
          firstWithdrawal: sortedTimestamps[0]?.toString() ?? "0",
          lastWithdrawal:
            sortedTimestamps[sortedTimestamps.length - 1]?.toString() ?? "0",
          paymasterCount: stats.paymasters.size,
        };
      })
      .sort((a, b) => b.withdrawalCount - a.withdrawalCount);
  }

  /**
   * Analyze revenue generation by paymaster.
   * Provides statistics for each paymaster including withdrawal count, total/average revenue,
   * first/last withdrawal timestamps, and the number of unique recipients they sent funds to.
   *
   * @returns A promise resolving to an array of paymaster revenue analysis objects.
   *
   * @example
   * ```typescript
   * const paymasterRevenue = await client.query().revenueWithdrawals()
   * .byNetwork("base-sepolia")
   * .getPaymasterRevenueAnalysis();
   * console.log(paymasterRevenue[0]); // { paymaster: "...", totalRevenue: "...", uniqueRecipients: ... }
   * ```
   */
  async getPaymasterRevenueAnalysis(): Promise<
    Array<{
      paymaster: string;
      paymasterType: PaymasterType;
      withdrawalCount: number;
      totalRevenue: string;
      averageWithdrawal: string;
      firstWithdrawal: string;
      lastWithdrawal: string;
      uniqueRecipients: number;
    }>
  > {
    const withdrawals = await this.execute();

    const paymasterStats: Record<
      string,
      {
        paymasterType: PaymasterType;
        withdrawalCount: number;
        totalRevenue: bigint;
        timestamps: number[];
        recipients: Set<string>;
      }
    > = {};

    for (const w of withdrawals) {
      const id = w.paymaster?.id;
      const type = w.paymaster?.contractType;
      if (!id || !type) continue;

      if (!paymasterStats[id]) {
        paymasterStats[id] = {
          paymasterType: type,
          withdrawalCount: 0,
          totalRevenue: 0n,
          timestamps: [],
          recipients: new Set(),
        };
      }

      paymasterStats[id].withdrawalCount += 1;
      paymasterStats[id].totalRevenue += BigInt(w.amount ?? 0);
      paymasterStats[id].timestamps.push(Number(w.withdrawnAtTimestamp ?? 0));
      if (w.recipient) paymasterStats[id].recipients.add(w.recipient);
    }

    return Object.entries(paymasterStats)
      .map(([paymaster, stats]) => {
        const sortedTimestamps = [...stats.timestamps].sort((a, b) => a - b);
        const averageWithdrawal =
          stats.withdrawalCount > 0
            ? stats.totalRevenue / BigInt(stats.withdrawalCount)
            : 0n;

        return {
          paymaster,
          paymasterType: stats.paymasterType,
          withdrawalCount: stats.withdrawalCount,
          totalRevenue: stats.totalRevenue.toString(),
          averageWithdrawal: averageWithdrawal.toString(),
          firstWithdrawal: sortedTimestamps[0]?.toString() ?? "0",
          lastWithdrawal:
            sortedTimestamps[sortedTimestamps.length - 1]?.toString() ?? "0",
          uniqueRecipients: stats.recipients.size,
        };
      })
      .sort((a, b) =>
        BigInt(b.totalRevenue) > BigInt(a.totalRevenue) ? 1 : -1,
      );
  }
}

/**
 * ========================================
 * CONVENIENCE FUNCTIONS (Updated to use new RevenueWithdrawalQueryBuilder)
 * ========================================
 */

/**
 * Get revenue withdrawals by a specific paymaster.
 *
 * @param client - The SubgraphClient instance.
 * @param paymasterAddress - The address of the paymaster contract.
 * @param network - The network identifier.
 * @returns A promise resolving to an array of RevenueWithdrawal entities.
 *
 * @example
 * ```typescript
 * const withdrawals = await getRevenueWithdrawalsByPaymaster(
 * client,
 * "0x3BEeC075aC5A77fFE0F9ee4bbb3DCBd07fA93fbf",
 * "base-sepolia"
 * );
 * ```
 */
export async function getRevenueWithdrawalsByPaymaster(
  client: SubgraphClient,
  paymasterAddress: string,
  network: NetworkName,
): Promise<RevenueWithdrawal[]> {
  return new RevenueWithdrawalQueryBuilder(client)
    .byNetwork(network)
    .byPaymaster(paymasterAddress)
    .orderByTimestamp()
    .execute();
}

/**
 * Get revenue withdrawals sent to a specific recipient.
 *
 * @param client - The SubgraphClient instance.
 * @param recipientAddress - The address of the recipient.
 * @param network - The network identifier.
 * @returns A promise resolving to an array of RevenueWithdrawal entities.
 *
 * @example
 * ```typescript
 * const withdrawals = await getRevenueWithdrawalsByRecipient(
 * client,
 * "0x456...",
 * "base-sepolia"
 * );
 * ```
 */
export async function getRevenueWithdrawalsByRecipient(
  client: SubgraphClient,
  recipientAddress: string,
  network: NetworkName,
): Promise<RevenueWithdrawal[]> {
  return new RevenueWithdrawalQueryBuilder(client)
    .byNetwork(network)
    .byRecipient(recipientAddress)
    .orderByTimestamp()
    .execute();
}

/**
 * Get the most recent revenue withdrawals.
 *
 * @param client - The SubgraphClient instance.
 * @param network - The network identifier.
 * @param limit - The maximum number of results to return (default is 10).
 * @returns A promise resolving to an array of recent RevenueWithdrawal entities.
 *
 * @example
 * ```typescript
 * const recentWithdrawals = await getRecentRevenueWithdrawals(client, "base-sepolia", 5);
 * ```
 */
export async function getRecentRevenueWithdrawals(
  client: SubgraphClient,
  network: NetworkName,
  limit: number = 10,
): Promise<RevenueWithdrawal[]> {
  return new RevenueWithdrawalQueryBuilder(client)
    .byNetwork(network)
    .orderByTimestamp()
    .limit(limit)
    .execute();
}

/**
 * Get revenue withdrawals above a certain amount.
 *
 * @param client - The SubgraphClient instance.
 * @param network - The network identifier.
 * @param minAmount - The minimum amount threshold in wei (as string).
 * @param limit - The maximum number of results to return (default is 10).
 * @returns A promise resolving to an array of large RevenueWithdrawal entities.
 *
 * @example
 * ```typescript
 * const largeWithdrawals = await getLargeRevenueWithdrawals(
 * client,
 * "base-sepolia",
 * "1000000000000000000", // 1 ETH
 * 3
 * );
 * ```
 */
export async function getLargeRevenueWithdrawals(
  client: SubgraphClient,
  network: NetworkName,
  minAmount: string,
  limit: number = 10,
): Promise<RevenueWithdrawal[]> {
  return new RevenueWithdrawalQueryBuilder(client)
    .byNetwork(network)
    .withMinAmount(minAmount)
    .orderByAmount()
    .limit(limit)
    .execute();
}

/**
 * Get withdrawal statistics for a specific paymaster.
 *
 * @param client - The SubgraphClient instance.
 * @param paymasterAddress - The address of the paymaster contract.
 * @param network - The network identifier.
 * @returns A promise resolving to an object containing withdrawal statistics for the given paymaster.
 *
 * @example
 * ```typescript
 * const paymasterStats = await getPaymasterWithdrawalStats(
 * client,
 * "0x3BEeC075aC5A77fFE0F9ee4bbb3DCBd07fA93fbf",
 * "base-sepolia"
 * );
 * console.log(paymasterStats);
 * ```
 */
export async function getPaymasterWithdrawalStats(
  client: SubgraphClient,
  paymasterAddress: string,
  network: NetworkName,
): Promise<{
  totalWithdrawals: number;
  totalAmount: string;
  averageAmount: string;
  minAmount: string;
  maxAmount: string;
  medianAmount: string;
  uniqueRecipients: number;
  uniquePaymasters: number; // This will effectively be 1 for a specific paymaster
  withdrawalFrequency: number;
}> {
  return new RevenueWithdrawalQueryBuilder(client)
    .byNetwork(network)
    .byPaymaster(paymasterAddress)
    .getWithdrawalStatistics();
}
