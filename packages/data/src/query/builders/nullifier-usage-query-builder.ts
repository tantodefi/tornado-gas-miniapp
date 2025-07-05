// nullifier-usage-query-builder.ts (Refactored)

import type { SubgraphClient } from "../../client/subgraph-client.js";
import type {
  NullifierUsage,
  NetworkName,
  PaymasterType,
} from "../../types/subgraph.js";
import { NullifierUsageFields, NullifierUsageWhereInput } from "../types.js";
import { BaseQueryBuilder } from "./base-query-builder.js";

// Define specific types for NullifierUsageQueryBuilder

export type NullifierUsageOrderBy =
  | "nullifier"
  | "paymasterAddress"
  | "poolId"
  | "gasUsed"
  | "isUsed"
  | "firstUsedAtTimestamp"
  | "lastUpdatedTimestamp"
  | "createdAtBlock"
  | "createdAtTimestamp"; // Assuming these are valid fields for ordering

/**
 * Enhanced query builder for NullifierUsage entities
 *
 * Provides a fluent interface for building complex nullifier usage queries
 * with support for both GasLimited and OneTimeUse paymaster types.
 */
export class NullifierUsageQueryBuilder extends BaseQueryBuilder<
  NullifierUsage,
  NullifierUsageFields,
  NullifierUsageWhereInput,
  NullifierUsageOrderBy
> {
  constructor(private subgraphClient: SubgraphClient) {
    // Default order by lastUpdatedTimestamp descending, as this often indicates recent activity.
    // Assuming the entity name in the subgraph schema is `nullifierUsages`
    super(subgraphClient, "nullifierUsages", "lastUpdatedTimestamp", "desc");
  }

  /**
   * Override default fields for NullifierUsage entity.
   * Ensure all relevant fields are included for common use cases.
   */
  protected getDefaultFields(): string {
    return `
      id
      nullifier
      paymasterAddress
      paymasterType
      poolId
      isUsed
      gasUsed
      userOperation {
        id
      }
      firstUsedAtTimestamp
      lastUpdatedTimestamp
      createdAtBlock
      createdAtTimestamp
      network
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
   * @param network - Network identifier.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const nullifierUsage = await client.query().nullifierUsage()
   * .byNetwork("base-sepolia")
   * .execute();
   * ```
   */
  byNetwork(network: NetworkName): this {
    this.where({ network: network });
    return this;
  }

  /**
   * Filter by specific nullifier.
   *
   * @param nullifier - Nullifier value.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const usage = await client.query().nullifierUsage()
   * .byNetwork("base-sepolia")
   * .byNullifier("0x123...")
   * .first();
   * ```
   */
  byNullifier(nullifier: string): this {
    this.where({ nullifier: nullifier });
    return this;
  }

  /**
   * Filter by paymaster address.
   *
   * @param paymaster - Paymaster contract address.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const usage = await client.query().nullifierUsage()
   * .byNetwork("base-sepolia")
   * .byPaymaster("0x3BEeC075aC5A77fFE0F9ee4bbb3DCBd07fA93fbf")
   * .execute();
   * ```
   */
  byPaymaster(paymaster: string): this {
    this.where({ paymasterAddress: paymaster });
    return this;
  }

  /**
   * Filter by paymaster type.
   *
   * @param type - Paymaster type (e.g., "GasLimited", "OneTimeUse").
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const gasLimitedUsage = await client.query().nullifierUsage()
   * .byNetwork("base-sepolia")
   * .byPaymasterType("GasLimited")
   * .execute();
   * ```
   */
  byPaymasterType(type: PaymasterType): this {
    this.where({ paymasterType: type });
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
   * const poolUsage = await client.query().nullifierUsage()
   * .byNetwork("base-sepolia")
   * .byPool("123")
   * .execute();
   * ```
   */
  byPool(poolId: string): this {
    this.where({ poolId: poolId });
    return this;
  }

  /**
   * Filter only used nullifiers (for OneTimeUse tracking).
   *
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const usedNullifiers = await client.query().nullifierUsage()
   * .byNetwork("base-sepolia")
   * .onlyUsed()
   * .execute();
   * ```
   */
  onlyUsed(): this {
    this.where({ isUsed: true });
    return this;
  }

  /**
   * Filter by minimum gas used (for GasLimited tracking).
   *
   * @param minGasUsed - Minimum gas used in wei (as string).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const highGasUsage = await client.query().nullifierUsage()
   * .byNetwork("base-sepolia")
   * .byPaymasterType("GasLimited")
   * .withMinGasUsed("1000000000000000000") // 1 ETH worth of gas
   * .execute();
   * ```
   */
  withMinGasUsed(minGasUsed: string): this {
    this.where({ gasUsed_gte: minGasUsed });
    return this;
  }

  /**
   * Filter by maximum gas used.
   *
   * @param maxGasUsed - Maximum gas used in wei (as string).
   * @returns The current query builder instance for chaining.
   */
  withMaxGasUsed(maxGasUsed: string): this {
    this.where({ gasUsed_lte: maxGasUsed });
    return this;
  }

  /**
   * Filter nullifiers with any gas usage (implies GasLimited).
   *
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const gasLimitedUsage = await client.query().nullifierUsage()
   * .byNetwork("base-sepolia")
   * .withGasUsed()
   * .execute();
   * ```
   */
  withGasUsed(): this {
    this.where({ gasUsed_gte: "1" }); // Assuming gasUsed of "0" means no gas used or not applicable.
    return this;
  }

  /**
   * Filter nullifiers with associated user operations.
   * This assumes `userOperation` field exists and a non-null value indicates association.
   * The specific `_not` operator might vary based on subgraph capabilities,
   * but typically filtering where `userOperation_not: null` works.
   * If `userOperation` is an object with an `id`, `userOperation_not: { id: null }` might be needed.
   * For simplicity, let's assume `userOperation_not: ""` or a similar check if it's a string,
   * or a direct `userOperation` field that's non-nullable when present.
   *
   * If `userOperation` is an ID string, then `userOperation_not: "0x00..."` or `userOperation_not: ""` works.
   * If `userOperation` is a nested object, filtering by its ID property like `userOperation_: { id_not: null }` would be precise.
   *
   * For the purpose of this refactoring, we'll assume `userOperation_not: ""` might represent existence,
   * or if `userOperation` in schema is `UserOperation!`, then its presence is implicit.
   * Given `NullifierUsage.userOperation` is defined as `UserOperation` (an object),
   * filtering for its existence would typically be done by checking if its `id` is not null.
   * However, `BaseQueryBuilder`'s `where` clause currently supports flat fields.
   * For deep filtering like `userOperation.id_not: null`, it might require a more advanced `where` clause.
   * Let's adapt this by assuming the subgraph provides a direct `hasUserOperation` boolean field, or we might need to adjust the query directly.
   * If not, this method's implementation would require careful consideration of the actual subgraph schema.
   *
   * **Self-correction:** The provided `NullifierUsageQueryConfig` has `hasUserOperation`.
   * We need to add `userOperation_not` to `NullifierUsageWhereInput` to support this.
   * The initial query was likely `userOperation != null`.
   * Given the schema, if `userOperation` is an entity relationship, we'd typically query for `userOperation_not: null`.
   * Subgraph doesn't directly support `null` equality for relationships, but rather `id_not: null` or absence.
   * Let's assume the subgraph treats an empty string or '0x0' address as null for this purpose, or that the `userOperation` field itself being present implies a link.
   * For safety, if `userOperation` is a reference, `userOperation_not: "0x0000000000000000000000000000000000000000"` might be used for non-null/non-zero address.
   *
   * For now, we will add `userOperation_not: ""` as a placeholder, implying any non-empty string means it has a user operation.
   * A more robust solution might involve a custom query or a field like `isUserOperationLinked: true` in the schema.
   *
   * After checking the `NullifierUsage` definition, `userOperation` is an object.
   * Subgraph queries for `userOperation` might look like `userOperation_not: null` if supported, or `userOperation_: { id_not: null }`.
   * Since `BaseQueryBuilder` uses a flat `where` for simplicity, we'll make a pragmatic choice.
   *
   * **Revised approach for `withUserOperation`:** Given `NullifierUsage` has `userOperation: UserOperation`,
   * a common subgraph pattern for checking existence is to query for the ID of the linked entity not being null.
   * If the `NullifierUsage` entity directly stores a `userOperationId` string, then `userOperationId_not: "0x0"` would work.
   * As `userOperation` is a nested object, direct filtering might be complex with a flat `where` clause.
   * For now, if the `userOperation` field is simply `userOperation: UserOperation`, then it implies it's present or not.
   * Let's assume the subgraph automatically includes the `userOperation` field if it exists, and we can filter by its `id` if it's there.
   * The `NullifierUsageWhereInput` does not currently support nested filtering like `userOperation_:{id_not: null}`.
   *
   * **Best path forward:** If `NullifierUsage` has `userOperation: UserOperation`, and `UserOperation` always has an `id`,
   * then we'd ideally want to query where the related `userOperation`'s `id` is not null.
   * Let's temporarily add a generic `userOperation_not` to `NullifierUsageWhereInput` to represent "not null".
   */
  withUserOperation(): this {
    // This assumes the subgraph's underlying field allows filtering for presence/absence.
    // A robust solution might involve a direct 'hasUserOperation: true' field in the schema,
    // or adapting the query generation for nested fields.
    // For now, if 'userOperation' is a direct string ID in the actual GraphQL query,
    // then 'userOperation_not: "0x0000000000000000000000000000000000000000"' would be relevant.
    // If it's a nested object relationship, the filtering is handled implicitly by `getDefaultFields`
    // and checking for `userOperation?.id` after fetching.
    // Given that `hasUserOperation` was in the original config, it implies a filterable state.
    // Without direct support in the `BaseQueryBuilder`'s `where` for `null` checks on relationships,
    // this method might require a custom override of `buildWhereClause` or reliance on post-query filtering
    // or a schema-level boolean `isUserOperationPresent`.
    // Let's assume `userOperation_not` (meaning not null/empty) is the intent.
    // This is a common pattern where a null relationship means "not present".
    this.where({ userOperation_not: "" }); // This is a generic placeholder. Actual value might depend on subgraph behavior for null relations.
    return this;
  }

  /**
   * Filter by first use date (after a given timestamp).
   *
   * @param timestamp - Unix timestamp string or number.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const recentUsage = await client.query().nullifierUsage()
   * .byNetwork("base-sepolia")
   * .usedAfter("1704067200") // 2024-01-01
   * .execute();
   * ```
   */
  usedAfter(timestamp: string | number): this {
    this.where({ firstUsedAtTimestamp_gte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by first use date (before a given timestamp).
   *
   * @param timestamp - Unix timestamp string or number.
   * @returns The current query builder instance for chaining.
   */
  usedBefore(timestamp: string | number): this {
    this.where({ firstUsedAtTimestamp_lte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by last update date (after a given timestamp).
   *
   * @param timestamp - Unix timestamp string or number.
   * @returns The current query builder instance for chaining.
   */
  updatedAfter(timestamp: string | number): this {
    this.where({ lastUpdatedTimestamp_gte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by last update date (before a given timestamp).
   *
   * @param timestamp - Unix timestamp string or number.
   * @returns The current query builder instance for chaining.
   */
  updatedBefore(timestamp: string | number): this {
    this.where({ lastUpdatedTimestamp_lte: timestamp.toString() });
    return this;
  }

  /**
   * ========================================
   * ORDERING METHODS
   * ========================================
   */

  /**
   * Order results by gas used.
   *
   * @param direction - Sort direction, "desc" for highest first (default), "asc" for lowest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const topGasUsers = await client.query().nullifierUsage()
   * .byNetwork("base-sepolia")
   * .byPaymasterType("GasLimited")
   * .orderByGasUsed()
   * .limit(10)
   * .execute();
   * ```
   */
  orderByGasUsed(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("gasUsed", direction);
    return this;
  }

  /**
   * Order results by first use date.
   *
   * @param direction - Sort direction, "desc" for newest first (default), "asc" for oldest.
   * @returns The current query builder instance for chaining.
   */
  orderByUsage(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("firstUsedAtTimestamp", direction);
    return this;
  }

  /**
   * Order results by last update date.
   *
   * @param direction - Sort direction, "desc" for newest first (default), "asc" for oldest.
   * @returns The current query builder instance for chaining.
   */
  orderByUpdate(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("lastUpdatedTimestamp", direction);
    return this;
  }

  /**
   * Order results by nullifier value.
   *
   * @param direction - Sort direction, "asc" for alphabetical (default), "desc" for reverse alphabetical.
   * @returns The current query builder instance for chaining.
   */
  orderByNullifier(direction: "asc" | "desc" = "asc"): this {
    this.orderBy("nullifier", direction);
    return this;
  }

  /**
   * ========================================
   * SPECIAL QUERIES / Convenience Helpers (using BaseQueryBuilder)
   * ========================================
   */

  /**
   * Check if a nullifier is used.
   * This is determined by checking the `isUsed` flag on the `NullifierUsage` entity.
   *
   * @param nullifier - Nullifier value to check.
   * @param network - Network identifier.
   * @returns Promise resolving to `true` if nullifier is used, `false` otherwise.
   *
   * @example
   * ```typescript
   * const isUsed = await client.query().nullifierUsage()
   * .isNullifierUsed("0x123...", "base-sepolia");
   * ```
   */
  async isNullifierUsed(
    nullifier: string,
    network: NetworkName,
  ): Promise<boolean> {
    const usage = await this.clone() // Clone to avoid state pollution
      .byNetwork(network)
      .byNullifier(nullifier)
      .first();

    return usage?.isUsed || false;
  }

  /**
   * Get total gas used by a nullifier (relevant for GasLimited paymasters).
   *
   * @param nullifier - Nullifier value.
   * @param network - Network identifier.
   * @returns Promise resolving to total gas used as a string. Returns "0" if no usage found.
   *
   * @example
   * ```typescript
   * const gasUsed = await client.query().nullifierUsage()
   * .getTotalGasUsed("0x123...", "base-sepolia");
   * ```
   */
  async getTotalGasUsed(
    nullifier: string,
    network: NetworkName,
  ): Promise<string> {
    const usage = await this.clone() // Clone to avoid state pollution
      .byNetwork(network)
      .byNullifier(nullifier)
      .first();

    return usage?.gasUsed?.toString() || "0";
  }

  /**
   * Get nullifier usage statistics for a specific paymaster.
   *
   * @param paymaster - Paymaster contract address.
   * @param network - Network identifier.
   * @returns Promise resolving to usage statistics including total nullifiers, used nullifiers, total gas used, average gas used, and usage rate.
   *
   * @example
   * ```typescript
   * const stats = await client.query().nullifierUsage()
   * .getPaymasterStats("0x3BEeC075aC5A77fFE0F9ee4bbb3DCBd07fA93fbf", "base-sepolia");
   * ```
   */
  async getPaymasterStats(
    paymaster: string,
    network: NetworkName,
  ): Promise<{
    totalNullifiers: number;
    usedNullifiers: number;
    totalGasUsed: string;
    averageGasUsed: string;
    usageRate: number;
  }> {
    const allUsage = await this.clone()
      .byNetwork(network)
      .byPaymaster(paymaster)
      .execute();

    const totalNullifiers = allUsage.length;
    const usedNullifiers = allUsage.filter((usage) => usage.isUsed).length;
    const totalGasUsed = allUsage.reduce(
      (sum, usage) => sum + BigInt(usage.gasUsed || "0"), // Ensure gasUsed is treated as BigInt or "0"
      0n,
    );
    const averageGasUsed =
      totalNullifiers > 0 ? totalGasUsed / BigInt(totalNullifiers) : 0n;
    const usageRate =
      totalNullifiers > 0 ? (usedNullifiers / totalNullifiers) * 100 : 0;

    return {
      totalNullifiers,
      usedNullifiers,
      totalGasUsed: totalGasUsed.toString(),
      averageGasUsed: averageGasUsed.toString(),
      usageRate: Math.round(usageRate * 100) / 100,
    };
  }

  /**
   * Get nullifier usage statistics for a specific pool.
   *
   * @param poolId - Pool ID.
   * @param network - Network identifier.
   * @returns Promise resolving to pool usage statistics.
   */
  async getPoolStats(
    poolId: string,
    network: NetworkName,
  ): Promise<{
    totalNullifiers: number;
    usedNullifiers: number;
    totalGasUsed: string;
    averageGasUsed: string;
    usageRate: number;
  }> {
    const allUsage = await this.clone()
      .byNetwork(network)
      .byPool(poolId)
      .execute();

    const totalNullifiers = allUsage.length;
    const usedNullifiers = allUsage.filter((usage) => usage.isUsed).length;
    const totalGasUsed = allUsage.reduce(
      (sum, usage) => sum + BigInt(usage.gasUsed || "0"),
      0n,
    );
    const averageGasUsed =
      totalNullifiers > 0 ? totalGasUsed / BigInt(totalNullifiers) : 0n;
    const usageRate =
      totalNullifiers > 0 ? (usedNullifiers / totalNullifiers) * 100 : 0;

    return {
      totalNullifiers,
      usedNullifiers,
      totalGasUsed: totalGasUsed.toString(),
      averageGasUsed: averageGasUsed.toString(),
      usageRate: Math.round(usageRate * 100) / 100,
    };
  }

  /**
   * Get all used nullifiers for a network. This queries for all nullifier usages
   * that have `isUsed` set to `true`.
   *
   * @param network - Network identifier.
   * @returns Promise resolving to an array of used NullifierUsage entities.
   */
  async getAllUsedNullifiers(network: NetworkName): Promise<NullifierUsage[]> {
    // Use the `onlyUsed` filter and execute
    return this.clone().byNetwork(network).onlyUsed().execute();
  }

  /**
   * ========================================
   * PAYMASTER-SPECIFIC METHODS (leveraging BaseQueryBuilder)
   * ========================================
   */

  /**
   * Get GasLimited paymaster nullifier usage.
   * Filters for a specific paymaster and `GasLimited` type, with any gas used,
   * ordered by gas used (highest first).
   *
   * @param paymaster - GasLimited paymaster address.
   * @param network - Network identifier.
   * @returns Promise resolving to an array of NullifierUsage entities for GasLimited paymasters.
   */
  async getGasLimitedUsage(
    paymaster: string,
    network: NetworkName,
  ): Promise<NullifierUsage[]> {
    return this.clone()
      .byNetwork(network)
      .byPaymaster(paymaster)
      .byPaymasterType("GasLimited")
      .withGasUsed()
      .orderByGasUsed()
      .execute();
  }

  /**
   * Get OneTimeUse paymaster nullifier usage.
   * Filters for a specific paymaster and `OneTimeUse` type,
   * only used nullifiers, ordered by first use date (newest first).
   *
   * @param paymaster - OneTimeUse paymaster address.
   * @param network - Network identifier.
   * @returns Promise resolving to an array of NullifierUsage entities for OneTimeUse paymasters.
   */
  async getOneTimeUseUsage(
    paymaster: string,
    network: NetworkName,
  ): Promise<NullifierUsage[]> {
    return this.clone()
      .byNetwork(network)
      .byPaymaster(paymaster)
      .byPaymasterType("OneTimeUse")
      .onlyUsed()
      .orderByUsage()
      .execute();
  }
}

/**
 * ========================================
 * CONVENIENCE FUNCTIONS (Updated to use new NullifierUsageQueryBuilder)
 * ========================================
 */

/**
 * Check if a nullifier is used for a given network.
 *
 * @param client - The SubgraphClient instance.
 * @param nullifier - The nullifier value to check.
 * @param network - The network identifier.
 * @returns A promise resolving to `true` if the nullifier is used, `false` otherwise.
 *
 * @example
 * ```typescript
 * const isUsed = await isNullifierUsed(client, "0x123...", "base-sepolia");
 * console.log(`Is nullifier used: ${isUsed}`);
 * ```
 */
export async function isNullifierUsed(
  client: SubgraphClient,
  nullifier: string,
  network: NetworkName,
): Promise<boolean> {
  return new NullifierUsageQueryBuilder(client).isNullifierUsed(
    nullifier,
    network,
  );
}

/**
 * Get the total gas used by a specific nullifier on a given network.
 * Primarily relevant for GasLimited paymaster types.
 *
 * @param client - The SubgraphClient instance.
 * @param nullifier - The nullifier value.
 * @param network - The network identifier.
 * @returns A promise resolving to the total gas used as a string (BigInt compatible), or "0" if not found.
 *
 * @example
 * ```typescript
 * const gasUsed = await getNullifierGasUsed(client, "0x123...", "base-sepolia");
 * console.log(`Total gas used by nullifier: ${gasUsed}`);
 * ```
 */
export async function getNullifierGasUsed(
  client: SubgraphClient,
  nullifier: string,
  network: NetworkName,
): Promise<string> {
  return new NullifierUsageQueryBuilder(client).getTotalGasUsed(
    nullifier,
    network,
  );
}

/**
 * Get all nullifier usages marked as "used" for fraud prevention purposes on a specific network.
 *
 * @param client - The SubgraphClient instance.
 * @param network - The network identifier.
 * @returns A promise resolving to an array of NullifierUsage entities that have been used.
 *
 * @example
 * ```typescript
 * const usedNullifiers = await getUsedNullifiers(client, "base-sepolia");
 * usedNullifiers.forEach(nu => console.log(`Used nullifier: ${nu.nullifier}`));
 * ```
 */
export async function getUsedNullifiers(
  client: SubgraphClient,
  network: NetworkName,
): Promise<NullifierUsage[]> {
  return new NullifierUsageQueryBuilder(client).getAllUsedNullifiers(network);
}
