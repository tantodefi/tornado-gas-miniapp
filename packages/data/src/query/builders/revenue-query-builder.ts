import { BaseQueryBuilder } from "./base-query-builder.js";
import {
  RevenueWithdrawalFields,
  RevenueWithdrawalWhereInput,
} from "../types.js";
import { RevenueWithdrawal, PaymasterContract } from "../../types/subgraph.js";
import type { SubgraphClient } from "../../client/subgraph-client.js";
import {
  serializeRevenueWithdrawal,
  SerializedRevenueWithdrawal,
} from "../../transformers/index.js";

/**
 * Default fields for RevenueWithdrawal
 */
const DEFAULT_REVENUE_WITHDRAWAL_FIELDS: RevenueWithdrawalFields[] = [
  "id",
  "recipient",
  "amount",
  "withdrawnAtTimestamp",
];

/**
 * Query builder for RevenueWithdrawal entities
 *
 * Provides methods to query and filter revenue withdrawals
 */
export class RevenueWithdrawalQueryBuilder extends BaseQueryBuilder<
  RevenueWithdrawal,
  RevenueWithdrawalFields,
  RevenueWithdrawalWhereInput
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
   * Filter by recipient address
   *
   * @param recipient - The recipient address
   * @returns this for method chaining
   */
  byRecipient(recipient: string): this {
    return this.where({ recipient });
  }

  /**
   * Filter by multiple recipient addresses
   *
   * @param recipients - Array of recipient addresses
   * @returns this for method chaining
   */
  byRecipients(recipients: string[]): this {
    return this.where({ recipient_in: recipients });
  }

  /**
   * Filter by recipient address pattern
   *
   * @param pattern - Pattern to match in recipient address
   * @returns this for method chaining
   */
  recipientContains(pattern: string): this {
    return this.where({ recipient_contains: pattern });
  }

  /**
   * Filter by withdrawal amount range
   *
   * @param minAmount - Minimum withdrawal amount (in wei as string)
   * @param maxAmount - Maximum withdrawal amount (in wei as string)
   * @returns this for method chaining
   */
  amountBetween(minAmount: string, maxAmount: string): this {
    return this.where({
      amount_gte: minAmount,
      amount_lte: maxAmount,
    });
  }

  /**
   * Filter by minimum withdrawal amount
   *
   * @param minAmount - Minimum withdrawal amount (in wei as string)
   * @returns this for method chaining
   */
  withMinAmount(minAmount: string): this {
    return this.where({ amount_gte: minAmount });
  }

  /**
   * Filter by maximum withdrawal amount
   *
   * @param maxAmount - Maximum withdrawal amount (in wei as string)
   * @returns this for method chaining
   */
  withMaxAmount(maxAmount: string): this {
    return this.where({ amount_lte: maxAmount });
  }

  /**
   * Filter withdrawals after specific timestamp
   *
   * @param timestamp - Minimum withdrawal timestamp
   * @returns this for method chaining
   */
  withdrawnAfter(timestamp: string): this {
    return this.where({ withdrawnAtTimestamp_gt: timestamp });
  }

  /**
   * Filter withdrawals before specific timestamp
   *
   * @param timestamp - Maximum withdrawal timestamp
   * @returns this for method chaining
   */
  withdrawnBefore(timestamp: string): this {
    return this.where({ withdrawnAtTimestamp_lt: timestamp });
  }

  /**
   * Filter withdrawals in a specific time range
   *
   * @param startTimestamp - Start of time range
   * @param endTimestamp - End of time range
   * @returns this for method chaining
   */
  withdrawnBetween(startTimestamp: string, endTimestamp: string): this {
    return this.where({
      withdrawnAtTimestamp_gte: startTimestamp,
      withdrawnAtTimestamp_lte: endTimestamp,
    });
  }

  /**
   * Filter withdrawals at or after specific block
   *
   * @param blockNumber - Minimum block number
   * @returns this for method chaining
   */
  withdrawnAtBlock(blockNumber: string): this {
    return this.where({ withdrawnAtBlock_gte: blockNumber });
  }

  /**
   * Order withdrawals by specific field and direction
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
   * Order withdrawals by withdrawal time (newest first)
   *
   * @returns this for method chaining
   */
  orderByNewestWithdrawn(): this {
    return this.orderBy("withdrawnAtTimestamp", "desc");
  }

  /**
   * Order withdrawals by withdrawal time (oldest first)
   *
   * @returns this for method chaining
   */
  orderByOldestWithdrawn(): this {
    return this.orderBy("withdrawnAtTimestamp", "asc");
  }

  /**
   * Order withdrawals by amount (highest first)
   *
   * @returns this for method chaining
   */
  orderByAmount(): this {
    return this.orderBy("amount", "desc");
  }

  /**
   * Build GraphQL query string for revenue withdrawals
   *
   * @private
   * @param fields - Fields to include in the query
   * @returns GraphQL query string
   */
  private buildRevenueWithdrawalQuery(
    fields: RevenueWithdrawalFields[],
  ): string {
    const fieldsList = fields.map((field) => `      ${field}`).join("\n");
    return `
      query GetRevenueWithdrawals(
        $first: Int!
        $skip: Int!
        $orderBy: RevenueWithdrawal_orderBy
        $orderDirection: OrderDirection
        $where: RevenueWithdrawal_filter
      ) {
        revenueWithdrawals(
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
   * Execute the query and return revenue withdrawal results
   *
   * @returns Promise resolving to array of RevenueWithdrawal entities
   */
  async execute(): Promise<RevenueWithdrawal[]> {
    const fields = this.selectedFields || DEFAULT_REVENUE_WITHDRAWAL_FIELDS;
    const query = this.buildRevenueWithdrawalQuery(fields);
    const variables = this.buildQueryVariables();

    const response = await this.client.executeQuery<{
      revenueWithdrawals: RevenueWithdrawal[];
    }>(query, variables);
    return response.revenueWithdrawals;
  }

  /**
   * Execute the query and return serialized revenue withdrawal results
   *
   * @returns Promise resolving to array of SerializedRevenueWithdrawal entities
   */
  async executeAndSerialize(): Promise<SerializedRevenueWithdrawal[]> {
    const withdrawals = await this.execute();
    return withdrawals.map(serializeRevenueWithdrawal);
  }

  /**
   * Get revenue withdrawal with paymaster data included
   *
   * @returns RevenueWithdrawalQueryWithPaymasterBuilder for extended functionality
   */
  withPaymaster(): RevenueWithdrawalQueryWithPaymasterBuilder {
    return new RevenueWithdrawalQueryWithPaymasterBuilder(
      this.client,
      this.getConfig(),
    );
  }

  /**
   * Get total withdrawn amount for a paymaster
   *
   * @param paymasterAddress - Paymaster contract address
   * @returns Promise resolving to total withdrawn amount as string
   */
  async getTotalWithdrawnByPaymaster(
    paymasterAddress: string,
  ): Promise<string> {
    const withdrawals = await this.byPaymaster(paymasterAddress).execute();
    return withdrawals.reduce((total, withdrawal) => {
      return (BigInt(total) + withdrawal.amount).toString();
    }, "0");
  }

  /**
   * Get total withdrawn amount for a recipient
   *
   * @param recipient - Recipient address
   * @returns Promise resolving to total withdrawn amount as string
   */
  async getTotalWithdrawnByRecipient(recipient: string): Promise<string> {
    const withdrawals = await this.byRecipient(recipient).execute();
    return withdrawals.reduce((total, withdrawal) => {
      return (BigInt(total) + withdrawal.amount).toString();
    }, "0");
  }

  /**
   * Clone the current query builder
   *
   * @returns New RevenueWithdrawalQueryBuilder instance with same configuration
   */
  clone(): RevenueWithdrawalQueryBuilder {
    const cloned = new RevenueWithdrawalQueryBuilder(this.client);
    cloned.config = { ...this.config };
    cloned.selectedFields = this.selectedFields
      ? [...this.selectedFields]
      : undefined;
    return cloned;
  }
}

/**
 * Extended query builder for revenue withdrawals that includes paymaster data
 */
export class RevenueWithdrawalQueryWithPaymasterBuilder extends BaseQueryBuilder<
  RevenueWithdrawal & { paymaster: PaymasterContract },
  RevenueWithdrawalFields,
  RevenueWithdrawalWhereInput
> {
  constructor(
    private client: SubgraphClient,
    private baseConfig: any,
  ) {
    super();
    this.config = { ...baseConfig };
  }

  /**
   * Execute query and return revenue withdrawals with paymaster data
   *
   * @returns Promise resolving to revenue withdrawals with paymaster data included
   */
  async execute(): Promise<
    (RevenueWithdrawal & { paymaster: PaymasterContract })[]
  > {
    const fields = this.selectedFields || DEFAULT_REVENUE_WITHDRAWAL_FIELDS;
    const fieldsList = fields.map((field) => `      ${field}`).join("\n");

    const query = `
      query GetRevenueWithdrawalsWithPaymaster(
        $first: Int!
        $skip: Int!
        $orderBy: RevenueWithdrawal_orderBy
        $orderDirection: OrderDirection
        $where: RevenueWithdrawal_filter
      ) {
        revenueWithdrawals(
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
      revenueWithdrawals: (RevenueWithdrawal & {
        paymaster: PaymasterContract;
      })[];
    }>(query, variables);

    return response.revenueWithdrawals;
  }

  /**
   * Execute query and return serialized revenue withdrawals with paymaster data
   *
   * @returns Promise resolving to array of SerializedRevenueWithdrawal entities with paymaster data
   */
  async executeAndSerialize(): Promise<SerializedRevenueWithdrawal[]> {
    const withdrawalsWithPaymaster = await this.execute();
    return withdrawalsWithPaymaster.map(serializeRevenueWithdrawal);
  }

  /**
   * Clone the current query builder
   *
   * @returns New RevenueWithdrawalQueryWithPaymasterBuilder instance with same configuration
   */
  clone(): RevenueWithdrawalQueryWithPaymasterBuilder {
    const cloned = new RevenueWithdrawalQueryWithPaymasterBuilder(
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
