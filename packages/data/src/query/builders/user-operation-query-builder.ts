import { BaseQueryBuilder } from "./base-query-builder.js";
import { UserOperationFields, UserOperationWhereInput } from "../types.js";
import {
  UserOperation,
  PaymasterContract,
  Pool,
} from "../../types/subgraph.js";
import type { SubgraphClient } from "../../client/subgraph-client.js";
import {
  serializeUserOperation,
  SerializedUserOperation,
} from "../../transformers/index.js";

/**
 * Default fields to fetch when no specific fields are selected
 */
const DEFAULT_USER_OPERATION_FIELDS: UserOperationFields[] = [
  "id",
  "userOpHash",
  "sender",
  "actualGasCost",
  "nullifier",
  "executedAtTimestamp",
];

/**
 * Query builder for UserOperation entities
 *
 * Provides methods to query and filter user operations with type safety
 */
export class UserOperationQueryBuilder extends BaseQueryBuilder<
  UserOperation,
  UserOperationFields,
  UserOperationWhereInput
> {
  constructor(private client: SubgraphClient) {
    super();
  }

  /**
   * Filter by specific user operation hash
   *
   * @param userOpHash - The user operation hash to filter by
   * @returns this for method chaining
   */
  byHash(userOpHash: string): this {
    return this.where({ userOpHash });
  }

  /**
   * Filter by multiple user operation hashes
   *
   * @param userOpHashes - Array of user operation hashes to filter by
   * @returns this for method chaining
   */
  byHashes(userOpHashes: string[]): this {
    return this.where({ userOpHash_in: userOpHashes });
  }

  /**
   * Filter by user operation hash pattern
   *
   * @param pattern - Pattern to match in user operation hash
   * @returns this for method chaining
   */
  hashContains(pattern: string): this {
    return this.where({ userOpHash_contains: pattern });
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
   * Filter by sender address
   *
   * @param sender - The sender address to filter by
   * @returns this for method chaining
   */
  bySender(sender: string): this {
    return this.where({ sender });
  }

  /**
   * Filter by multiple sender addresses
   *
   * @param senders - Array of sender addresses to filter by
   * @returns this for method chaining
   */
  bySenders(senders: string[]): this {
    return this.where({ sender_in: senders });
  }

  /**
   * Filter by sender address pattern
   *
   * @param pattern - Pattern to match in sender address
   * @returns this for method chaining
   */
  senderContains(pattern: string): this {
    return this.where({ sender_contains: pattern });
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
   * Filter by actual gas cost range
   *
   * @param minGasCost - Minimum gas cost (in wei as string)
   * @param maxGasCost - Maximum gas cost (in wei as string)
   * @returns this for method chaining
   */
  gasCostBetween(minGasCost: string, maxGasCost: string): this {
    return this.where({
      actualGasCost_gte: minGasCost,
      actualGasCost_lte: maxGasCost,
    });
  }

  /**
   * Filter by minimum gas cost
   *
   * @param minGasCost - Minimum gas cost (in wei as string)
   * @returns this for method chaining
   */
  withMinGasCost(minGasCost: string): this {
    return this.where({ actualGasCost_gte: minGasCost });
  }

  /**
   * Filter by maximum gas cost
   *
   * @param maxGasCost - Maximum gas cost (in wei as string)
   * @returns this for method chaining
   */
  withMaxGasCost(maxGasCost: string): this {
    return this.where({ actualGasCost_lte: maxGasCost });
  }

  /**
   * Filter by gas price range
   *
   * @param minGasPrice - Minimum gas price (in wei as string)
   * @param maxGasPrice - Maximum gas price (in wei as string)
   * @returns this for method chaining
   */
  gasPriceBetween(minGasPrice: string, maxGasPrice: string): this {
    return this.where({
      gasPrice_gte: minGasPrice,
      gasPrice_lte: maxGasPrice,
    });
  }

  /**
   * Filter by total gas used range
   *
   * @param minGasUsed - Minimum total gas used
   * @param maxGasUsed - Maximum total gas used
   * @returns this for method chaining
   */
  totalGasUsedBetween(minGasUsed: string, maxGasUsed: string): this {
    return this.where({
      totalGasUsed_gte: minGasUsed,
      totalGasUsed_lte: maxGasUsed,
    });
  }

  /**
   * Filter operations executed after specific timestamp
   *
   * @param timestamp - Minimum execution timestamp
   * @returns this for method chaining
   */
  executedAfter(timestamp: string): this {
    return this.where({ executedAtTimestamp_gt: timestamp });
  }

  /**
   * Filter operations executed before specific timestamp
   *
   * @param timestamp - Maximum execution timestamp
   * @returns this for method chaining
   */
  executedBefore(timestamp: string): this {
    return this.where({ executedAtTimestamp_lt: timestamp });
  }

  /**
   * Filter operations executed in a specific time range
   *
   * @param startTimestamp - Start of time range
   * @param endTimestamp - End of time range
   * @returns this for method chaining
   */
  executedBetween(startTimestamp: string, endTimestamp: string): this {
    return this.where({
      executedAtTimestamp_gte: startTimestamp,
      executedAtTimestamp_lte: endTimestamp,
    });
  }

  /**
   * Filter operations executed at or after specific block
   *
   * @param blockNumber - Minimum block number
   * @returns this for method chaining
   */
  executedAtBlock(blockNumber: string): this {
    return this.where({ executedAtBlock_gte: blockNumber });
  }

  /**
   * Filter operations executed in a specific block range
   *
   * @param startBlock - Start block number
   * @param endBlock - End block number
   * @returns this for method chaining
   */
  executedInBlockRange(startBlock: string, endBlock: string): this {
    return this.where({
      executedAtBlock_gte: startBlock,
      executedAtBlock_lte: endBlock,
    });
  }

  /**
   * Order operations by specific field and direction
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
   * Order operations by execution time (newest first)
   *
   * @returns this for method chaining
   */
  orderByNewestExecuted(): this {
    return this.orderBy("executedAtTimestamp", "desc");
  }

  /**
   * Order operations by execution time (oldest first)
   *
   * @returns this for method chaining
   */
  orderByOldestExecuted(): this {
    return this.orderBy("executedAtTimestamp", "asc");
  }

  /**
   * Order operations by gas cost (highest first)
   *
   * @returns this for method chaining
   */
  orderByGasCost(): this {
    return this.orderBy("actualGasCost", "desc");
  }

  /**
   * Order operations by gas price (highest first)
   *
   * @returns this for method chaining
   */
  orderByGasPrice(): this {
    return this.orderBy("gasPrice", "desc");
  }

  /**
   * Order operations by total gas used (highest first)
   *
   * @returns this for method chaining
   */
  orderByTotalGasUsed(): this {
    return this.orderBy("totalGasUsed", "desc");
  }

  /**
   * Build GraphQL query string for user operations
   *
   * @private
   * @param fields - Fields to include in the query
   * @returns GraphQL query string
   */
  private buildUserOperationQuery(fields: UserOperationFields[]): string {
    const fieldsList = fields.map((field) => `      ${field}`).join("\n");
    return `
      query GetUserOperations(
        $first: Int!
        $skip: Int!
        $orderBy: UserOperation_orderBy
        $orderDirection: OrderDirection
        $where: UserOperation_filter
      ) {
        userOperations(
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
   * Execute the query and return user operation results
   *
   * @returns Promise resolving to array of UserOperation entities
   */
  async execute(): Promise<UserOperation[]> {
    const fields = this.selectedFields || DEFAULT_USER_OPERATION_FIELDS;
    const query = this.buildUserOperationQuery(fields);
    const variables = this.buildQueryVariables();

    const response = await this.client.executeQuery<{
      userOperations: UserOperation[];
    }>(query, variables);
    return response.userOperations;
  }

  /**
   * Execute the query and return serialized user operation results
   *
   * @returns Promise resolving to array of SerializedUserOperation entities
   */
  async executeAndSerialize(): Promise<SerializedUserOperation[]> {
    const userOperations = await this.execute();
    return userOperations.map(serializeUserOperation);
  }

  /**
   * Get user operation with paymaster and pool data included
   *
   * @returns UserOperationQueryWithRelatedBuilder for extended functionality
   */
  withRelated(): UserOperationQueryWithRelatedBuilder {
    return new UserOperationQueryWithRelatedBuilder(
      this.client,
      this.getConfig(),
    );
  }

  /**
   * Get user operation by hash
   *
   * @param userOpHash - User operation hash
   * @returns Promise resolving to user operation or null if not found
   */
  async getUserOperationByHash(
    userOpHash: string,
  ): Promise<UserOperation | null> {
    return await this.byHash(userOpHash).first();
  }

  /**
   * Get user operations for a specific sender
   *
   * @param sender - Sender address
   * @param options - Pagination options
   * @returns Promise resolving to array of user operations
   */
  async getUserOperationsBySender(
    sender: string,
    options: { first?: number; skip?: number } = {},
  ): Promise<UserOperation[]> {
    const { first = 100, skip = 0 } = options;
    return await this.bySender(sender)
      .orderByNewestExecuted()
      .limit(first)
      .skip(skip)
      .execute();
  }

  /**
   * Get user operations for a specific paymaster
   *
   * @param paymasterAddress - Paymaster contract address
   * @param options - Pagination options
   * @returns Promise resolving to array of user operations
   */
  async getUserOperationsByPaymaster(
    paymasterAddress: string,
    options: { first?: number; skip?: number } = {},
  ): Promise<UserOperation[]> {
    const { first = 100, skip = 0 } = options;
    return await this.byPaymaster(paymasterAddress)
      .orderByNewestExecuted()
      .limit(first)
      .skip(skip)
      .execute();
  }

  /**
   * Get user operations for a specific pool
   *
   * @param poolId - Pool ID
   * @param options - Pagination options
   * @returns Promise resolving to array of user operations
   */
  async getUserOperationsByPool(
    poolId: string,
    options: { first?: number; skip?: number } = {},
  ): Promise<UserOperation[]> {
    const { first = 100, skip = 0 } = options;
    return await this.byPool(poolId)
      .orderByNewestExecuted()
      .limit(first)
      .skip(skip)
      .execute();
  }

  /**
   * Get total gas spent by a sender
   *
   * @param sender - Sender address
   * @returns Promise resolving to total gas cost as string
   */
  async getTotalGasSpentBySender(sender: string): Promise<string> {
    const userOps = await this.bySender(sender).execute();
    return userOps.reduce((total, op) => {
      return (BigInt(total) + op.actualGasCost).toString();
    }, "0");
  }

  /**
   * Get total gas spent in a pool
   *
   * @param poolId - Pool ID
   * @returns Promise resolving to total gas cost as string
   */
  async getTotalGasSpentInPool(poolId: string): Promise<string> {
    const userOps = await this.byPool(poolId).execute();
    return userOps.reduce((total, op) => {
      return (BigInt(total) + op.actualGasCost).toString();
    }, "0");
  }

  /**
   * Check if a user operation exists by hash
   *
   * @param userOpHash - User operation hash to check
   * @returns Promise resolving to true if operation exists, false otherwise
   */
  async userOperationExists(userOpHash: string): Promise<boolean> {
    return await this.byHash(userOpHash).exists();
  }

  /**
   * Clone the current query builder
   *
   * @returns New UserOperationQueryBuilder instance with same configuration
   */
  clone(): UserOperationQueryBuilder {
    const cloned = new UserOperationQueryBuilder(this.client);
    cloned.config = { ...this.config };
    cloned.selectedFields = this.selectedFields
      ? [...this.selectedFields]
      : undefined;
    return cloned;
  }
}

/**
 * Extended query builder for user operations that includes related data
 */
export class UserOperationQueryWithRelatedBuilder extends BaseQueryBuilder<
  UserOperation & {
    paymaster: PaymasterContract;
    pool: Pool;
  },
  UserOperationFields,
  UserOperationWhereInput
> {
  constructor(
    private client: SubgraphClient,
    private baseConfig: any,
  ) {
    super();
    this.config = { ...baseConfig };
  }

  /**
   * Build GraphQL query string for user operations with related data
   *
   * @private
   * @param fields - User operation fields to include in the query
   * @returns GraphQL query string
   */
  private buildUserOperationWithRelatedQuery(
    fields: UserOperationFields[],
  ): string {
    const fieldsList = fields.map((field) => `      ${field}`).join("\n");
    return `
      query GetUserOperationsWithRelated(
        $first: Int!
        $skip: Int!
        $orderBy: UserOperation_orderBy
        $orderDirection: OrderDirection
        $where: UserOperation_filter
      ) {
        userOperations(
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
            totalUsersDeposit
            currentDeposit
            revenue
          }
          pool {
            id
            poolId
            joiningFee
            totalDeposits
            memberCount
            currentMerkleRoot
            createdAtTimestamp
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
   * Execute query and return user operations with related data
   *
   * @returns Promise resolving to user operations with paymaster and pool data included
   */
  async execute(): Promise<
    (UserOperation & { paymaster: PaymasterContract; pool: Pool })[]
  > {
    const fields = this.selectedFields || DEFAULT_USER_OPERATION_FIELDS;
    const query = this.buildUserOperationWithRelatedQuery(fields);
    const variables = this.buildQueryVariables();

    const response = await this.client.executeQuery<{
      userOperations: (UserOperation & {
        paymaster: PaymasterContract;
        pool: Pool;
      })[];
    }>(query, variables);

    return response.userOperations;
  }

  /**
   * Execute query and return serialized user operations with related data
   *
   * @returns Promise resolving to array of SerializedUserOperation entities with related data
   */
  async executeAndSerialize(): Promise<SerializedUserOperation[]> {
    const userOperationsWithRelated = await this.execute();
    return userOperationsWithRelated.map(serializeUserOperation);
  }

  /**
   * Clone the current query builder
   *
   * @returns New UserOperationQueryWithRelatedBuilder instance with same configuration
   */
  clone(): UserOperationQueryWithRelatedBuilder {
    const cloned = new UserOperationQueryWithRelatedBuilder(
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
