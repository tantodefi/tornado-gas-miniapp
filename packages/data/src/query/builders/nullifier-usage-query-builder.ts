import { BaseQueryBuilder } from "./base-query-builder.js";
import { NullifierUsageFields, NullifierUsageWhereInput } from "../types.js";
import {
  NullifierUsage,
  PaymasterContract,
  Pool,
  UserOperation,
} from "../../types/subgraph.js";
import type { SubgraphClient } from "../../client/subgraph-client.js";
import {
  serializeNullifierUsage,
  SerializedNullifierUsage,
} from "../../transformers/index.js";

/**
 * Default fields for NullifierUsage
 */
const DEFAULT_NULLIFIER_USAGE_FIELDS: NullifierUsageFields[] = [
  "id",
  "nullifier",
  "isUsed",
  "gasUsed",
  "lastUpdatedTimestamp",
];

/**
 * Query builder for NullifierUsage entities
 *
 * Provides methods to query and filter nullifier usage
 */
export class NullifierUsageQueryBuilder extends BaseQueryBuilder<
  NullifierUsage,
  NullifierUsageFields,
  NullifierUsageWhereInput
> {
  constructor(private client: SubgraphClient) {
    super();
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
   * Filter by specific pool ID
   *
   * @param poolId - The pool ID to filter by
   * @returns this for method chaining
   */
  byPool(poolId: string): this {
    return this.where({ pool: poolId });
  }

  /**
   * Filter by multiple pool IDs
   *
   * @param poolIds - Array of pool IDs to filter by
   * @returns this for method chaining
   */
  byPools(poolIds: string[]): this {
    return this.where({ pool_in: poolIds });
  }

  /**
   * Filter by specific nullifier
   *
   * @param nullifier - The nullifier value to filter by
   * @returns this for method chaining
   */
  byNullifier(nullifier: string): this {
    return this.where({ nullifier });
  }

  /**
   * Filter by multiple nullifiers
   *
   * @param nullifiers - Array of nullifier values to filter by
   * @returns this for method chaining
   */
  byNullifiers(nullifiers: string[]): this {
    return this.where({ nullifier_in: nullifiers });
  }

  /**
   * Filter by nullifier pattern
   *
   * @param pattern - Pattern to match in nullifier
   * @returns this for method chaining
   */
  nullifierContains(pattern: string): this {
    return this.where({ nullifier_contains: pattern });
  }

  /**
   * Filter by usage status
   *
   * @param isUsed - Whether nullifier is used
   * @returns this for method chaining
   */
  byUsageStatus(isUsed: boolean): this {
    return this.where({ isUsed });
  }

  /**
   * Filter only used nullifiers
   *
   * @returns this for method chaining
   */
  usedOnly(): this {
    return this.byUsageStatus(true);
  }

  /**
   * Filter only unused nullifiers
   *
   * @returns this for method chaining
   */
  unusedOnly(): this {
    return this.byUsageStatus(false);
  }

  /**
   * Filter by gas usage range
   *
   * @param minGasUsed - Minimum gas used (in wei as string)
   * @param maxGasUsed - Maximum gas used (in wei as string)
   * @returns this for method chaining
   */
  gasUsedBetween(minGasUsed: string, maxGasUsed: string): this {
    return this.where({
      gasUsed_gte: minGasUsed,
      gasUsed_lte: maxGasUsed,
    });
  }

  /**
   * Filter by minimum gas used
   *
   * @param minGasUsed - Minimum gas used (in wei as string)
   * @returns this for method chaining
   */
  withMinGasUsed(minGasUsed: string): this {
    return this.where({ gasUsed_gte: minGasUsed });
  }

  /**
   * Filter by maximum gas used
   *
   * @param maxGasUsed - Maximum gas used (in wei as string)
   * @returns this for method chaining
   */
  withMaxGasUsed(maxGasUsed: string): this {
    return this.where({ gasUsed_lte: maxGasUsed });
  }

  /**
   * Filter nullifiers first used after specific timestamp
   *
   * @param timestamp - Minimum first use timestamp
   * @returns this for method chaining
   */
  firstUsedAfter(timestamp: string): this {
    return this.where({ firstUsedAtTimestamp_gt: timestamp });
  }

  /**
   * Filter nullifiers first used before specific timestamp
   *
   * @param timestamp - Maximum first use timestamp
   * @returns this for method chaining
   */
  firstUsedBefore(timestamp: string): this {
    return this.where({ firstUsedAtTimestamp_lt: timestamp });
  }

  /**
   * Filter nullifiers last updated after specific timestamp
   *
   * @param timestamp - Minimum last update timestamp
   * @returns this for method chaining
   */
  lastUpdatedAfter(timestamp: string): this {
    return this.where({ lastUpdatedTimestamp_gt: timestamp });
  }

  /**
   * Order nullifier usage by specific field and direction
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
   * Order nullifier usage by last update time (newest first)
   *
   * @returns this for method chaining
   */
  orderByNewestUpdated(): this {
    return this.orderBy("lastUpdatedTimestamp", "desc");
  }

  /**
   * Order nullifier usage by first use time (newest first)
   *
   * @returns this for method chaining
   */
  orderByNewestUsed(): this {
    return this.orderBy("firstUsedAtTimestamp", "desc");
  }

  /**
   * Order nullifier usage by gas used (highest first)
   *
   * @returns this for method chaining
   */
  orderByGasUsed(): this {
    return this.orderBy("gasUsed", "desc");
  }

  /**
   * Build GraphQL query string for nullifier usage
   *
   * @private
   * @param fields - Fields to include in the query
   * @returns GraphQL query string
   */
  private buildNullifierUsageQuery(fields: NullifierUsageFields[]): string {
    const fieldsList = fields.map((field) => `      ${field}`).join("\n");
    return `
      query GetNullifierUsage(
        $first: Int!
        $skip: Int!
        $orderBy: NullifierUsage_orderBy
        $orderDirection: OrderDirection
        $where: NullifierUsage_filter
      ) {
        nullifierUsages(
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
   * Execute the query and return nullifier usage results
   *
   * @returns Promise resolving to array of NullifierUsage entities
   */
  async execute(): Promise<NullifierUsage[]> {
    const fields = this.selectedFields || DEFAULT_NULLIFIER_USAGE_FIELDS;
    const query = this.buildNullifierUsageQuery(fields);
    const variables = this.buildQueryVariables();

    const response = await this.client.executeQuery<{
      nullifierUsages: NullifierUsage[];
    }>(query, variables);
    return response.nullifierUsages;
  }

  /**
   * Execute the query and return serialized nullifier usage results
   *
   * @returns Promise resolving to array of SerializedNullifierUsage entities
   */
  async executeAndSerialize(): Promise<SerializedNullifierUsage[]> {
    const nullifierUsages = await this.execute();
    return nullifierUsages.map(serializeNullifierUsage);
  }

  /**
   * Get nullifier usage with related data included
   *
   * @returns NullifierUsageQueryWithRelatedBuilder for extended functionality
   */
  withRelated(): NullifierUsageQueryWithRelatedBuilder {
    return new NullifierUsageQueryWithRelatedBuilder(
      this.client,
      this.getConfig(),
    );
  }

  /**
   * Get total gas used for a specific pool
   *
   * @param poolId - Pool ID
   * @returns Promise resolving to total gas used as string
   */
  async getTotalGasUsedByPool(poolId: string): Promise<string> {
    const nullifierUsages = await this.byPool(poolId).execute();
    return nullifierUsages.reduce((total, usage) => {
      return (BigInt(total) + usage.gasUsed).toString();
    }, "0");
  }

  /**
   * Get nullifier usage statistics for a paymaster
   *
   * @param paymasterAddress - Paymaster contract address
   * @returns Promise resolving to usage statistics
   */
  async getUsageStatsByPaymaster(paymasterAddress: string) {
    const nullifierUsages = await this.byPaymaster(paymasterAddress).execute();

    const totalNullifiers = nullifierUsages.length;
    const usedNullifiers = nullifierUsages.filter(
      (usage) => usage.isUsed,
    ).length;
    const unusedNullifiers = totalNullifiers - usedNullifiers;

    const totalGasUsed = nullifierUsages.reduce((total, usage) => {
      return (BigInt(total) + usage.gasUsed).toString();
    }, "0");

    return {
      totalNullifiers,
      usedNullifiers,
      unusedNullifiers,
      usageRate:
        totalNullifiers > 0
          ? ((usedNullifiers / totalNullifiers) * 100).toFixed(2) + "%"
          : "0%",
      totalGasUsed,
      averageGasUsed:
        usedNullifiers > 0
          ? (BigInt(totalGasUsed) / BigInt(usedNullifiers)).toString()
          : "0",
    };
  }

  /**
   * Clone the current query builder
   *
   * @returns New NullifierUsageQueryBuilder instance with same configuration
   */
  clone(): NullifierUsageQueryBuilder {
    const cloned = new NullifierUsageQueryBuilder(this.client);
    cloned.config = { ...this.config };
    cloned.selectedFields = this.selectedFields
      ? [...this.selectedFields]
      : undefined;
    return cloned;
  }
}

/**
 * Extended query builder for nullifier usage that includes related data
 */
export class NullifierUsageQueryWithRelatedBuilder extends BaseQueryBuilder<
  NullifierUsage & {
    paymaster: PaymasterContract;
    pool: Pool;
    userOperation?: UserOperation;
  },
  NullifierUsageFields,
  NullifierUsageWhereInput
> {
  constructor(
    private client: SubgraphClient,
    private baseConfig: any,
  ) {
    super();
    this.config = { ...baseConfig };
  }

  /**
   * Execute query and return nullifier usage with related data
   *
   * @returns Promise resolving to nullifier usage with related data included
   */
  async execute(): Promise<
    (NullifierUsage & {
      paymaster: PaymasterContract;
      pool: Pool;
      userOperation?: UserOperation;
    })[]
  > {
    const fields = this.selectedFields || DEFAULT_NULLIFIER_USAGE_FIELDS;
    const fieldsList = fields.map((field) => `      ${field}`).join("\n");

    const query = `
      query GetNullifierUsageWithRelated(
        $first: Int!
        $skip: Int!
        $orderBy: NullifierUsage_orderBy
        $orderDirection: OrderDirection
        $where: NullifierUsage_filter
      ) {
        nullifierUsages(
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
          pool {
            id
            poolId
            joiningFee
            memberCount
          }
          userOperation {
            id
            userOpHash
            sender
            actualGasCost
            executedAtTimestamp
          }
        }
      }
    `;

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

    const response = await this.client.executeQuery<{
      nullifierUsages: (NullifierUsage & {
        paymaster: PaymasterContract;
        pool: Pool;
        userOperation?: UserOperation;
      })[];
    }>(query, variables);

    return response.nullifierUsages;
  }

  /**
   * Execute query and return serialized nullifier usage with related data
   *
   * @returns Promise resolving to array of SerializedNullifierUsage entities with related data
   */
  async executeAndSerialize(): Promise<SerializedNullifierUsage[]> {
    const nullifierUsagesWithRelated = await this.execute();
    return nullifierUsagesWithRelated.map(serializeNullifierUsage);
  }

  /**
   * Clone the current query builder
   *
   * @returns New NullifierUsageQueryWithRelatedBuilder instance with same configuration
   */
  clone(): NullifierUsageQueryWithRelatedBuilder {
    const cloned = new NullifierUsageQueryWithRelatedBuilder(
      this.client,
      this.baseConfig,
    );
    cloned.config = { ...this.config };
    cloned.selectedFields = this.selectedFields
      ? [...this.selectedFields]
      : undefined;
    return cloned;
  }
}
