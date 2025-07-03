import { BaseQueryBuilder } from "./base-query-builder.js";
import {
  PaymasterContractFields,
  PaymasterContractWhereInput,
} from "../types.js";
import {
  PaymasterContract,
  Pool,
  UserOperation,
  RevenueWithdrawal,
} from "../../types/subgraph.js";
import type { SubgraphClient } from "../../client/subgraph-client.js";
import {
  serializePaymasterContract,
  SerializedPaymasterContract,
} from "../../transformers/index.js";

/**
 * Default fields to fetch when no specific fields are selected
 */
const DEFAULT_PAYMASTER_FIELDS: PaymasterContractFields[] = [
  "id",
  "contractType",
  "address",
  "totalUsersDeposit",
  "currentDeposit",
  "revenue",
  "deployedAtTimestamp",
];

/**
 * Query builder for PaymasterContract entities
 *
 * Provides methods to query and filter paymaster contracts with type safety
 */
export class PaymasterContractQueryBuilder extends BaseQueryBuilder<
  PaymasterContract,
  PaymasterContractFields,
  PaymasterContractWhereInput
> {
  constructor(private client: SubgraphClient) {
    super();
  }

  /**
   * Filter by specific paymaster contract address
   *
   * @param address - The contract address to filter by
   * @returns this for method chaining
   */
  byAddress(address: string): this {
    return this.where({ address });
  }

  /**
   * Filter by multiple paymaster contract addresses
   *
   * @param addresses - Array of contract addresses to filter by
   * @returns this for method chaining
   */
  byAddresses(addresses: string[]): this {
    return this.where({ address_in: addresses });
  }

  /**
   * Filter by contract type
   *
   * @param contractType - Contract type ("GasLimited" or "OneTimeUse")
   * @returns this for method chaining
   */
  byType(contractType: "GasLimited" | "OneTimeUse"): this {
    return this.where({ contractType });
  }

  /**
   * Filter by multiple contract types
   *
   * @param contractTypes - Array of contract types
   * @returns this for method chaining
   */
  byTypes(contractTypes: Array<"GasLimited" | "OneTimeUse">): this {
    return this.where({ contractType_in: contractTypes });
  }

  /**
   * Filter paymasters with minimum total user deposits
   *
   * @param minDeposit - Minimum total user deposits (in wei as string)
   * @returns this for method chaining
   */
  withMinDeposits(minDeposit: string): this {
    return this.where({ totalUsersDeposit_gte: minDeposit });
  }

  /**
   * Filter paymasters with maximum total user deposits
   *
   * @param maxDeposit - Maximum total user deposits (in wei as string)
   * @returns this for method chaining
   */
  withMaxDeposits(maxDeposit: string): this {
    return this.where({ totalUsersDeposit_lte: maxDeposit });
  }

  /**
   * Filter paymasters by total user deposits range
   *
   * @param minDeposit - Minimum total user deposits (in wei as string)
   * @param maxDeposit - Maximum total user deposits (in wei as string)
   * @returns this for method chaining
   */
  depositsBetween(minDeposit: string, maxDeposit: string): this {
    return this.where({
      totalUsersDeposit_gte: minDeposit,
      totalUsersDeposit_lte: maxDeposit,
    });
  }

  /**
   * Filter paymasters with minimum current deposit
   *
   * @param minDeposit - Minimum current deposit (in wei as string)
   * @returns this for method chaining
   */
  withMinCurrentDeposit(minDeposit: string): this {
    return this.where({ currentDeposit_gte: minDeposit });
  }

  /**
   * Filter paymasters by current deposit range
   *
   * @param minDeposit - Minimum current deposit (in wei as string)
   * @param maxDeposit - Maximum current deposit (in wei as string)
   * @returns this for method chaining
   */
  currentDepositBetween(minDeposit: string, maxDeposit: string): this {
    return this.where({
      currentDeposit_gte: minDeposit,
      currentDeposit_lte: maxDeposit,
    });
  }

  /**
   * Filter paymasters with minimum revenue
   *
   * @param minRevenue - Minimum revenue (in wei as string)
   * @returns this for method chaining
   */
  withMinRevenue(minRevenue: string): this {
    return this.where({ revenue_gte: minRevenue });
  }

  /**
   * Filter paymasters with positive revenue
   *
   * @returns this for method chaining
   */
  withPositiveRevenue(): this {
    return this.where({ revenue_gt: "0" });
  }

  /**
   * Filter paymasters by revenue range
   *
   * @param minRevenue - Minimum revenue (in wei as string)
   * @param maxRevenue - Maximum revenue (in wei as string)
   * @returns this for method chaining
   */
  revenueBetween(minRevenue: string, maxRevenue: string): this {
    return this.where({
      revenue_gte: minRevenue,
      revenue_lte: maxRevenue,
    });
  }

  /**
   * Filter paymasters deployed after specific timestamp
   *
   * @param timestamp - Minimum deployment timestamp
   * @returns this for method chaining
   */
  deployedAfter(timestamp: string): this {
    return this.where({ deployedAtTimestamp_gt: timestamp });
  }

  /**
   * Filter paymasters deployed before specific timestamp
   *
   * @param timestamp - Maximum deployment timestamp
   * @returns this for method chaining
   */
  deployedBefore(timestamp: string): this {
    return this.where({ deployedAtTimestamp_lt: timestamp });
  }

  /**
   * Filter paymasters deployed in a specific time range
   *
   * @param startTimestamp - Start of time range
   * @param endTimestamp - End of time range
   * @returns this for method chaining
   */
  deployedBetween(startTimestamp: string, endTimestamp: string): this {
    return this.where({
      deployedAtTimestamp_gte: startTimestamp,
      deployedAtTimestamp_lte: endTimestamp,
    });
  }

  /**
   * Filter paymasters by address pattern
   *
   * @param pattern - Pattern to match in address
   * @returns this for method chaining
   */
  addressContains(pattern: string): this {
    return this.where({ address_contains: pattern });
  }

  /**
   * Order paymasters by specific field and direction
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
   * Order paymasters by deployment date (newest first)
   *
   * @returns this for method chaining
   */
  orderByNewestDeployed(): this {
    return this.orderBy("deployedAtTimestamp", "desc");
  }

  /**
   * Order paymasters by deployment date (oldest first)
   *
   * @returns this for method chaining
   */
  orderByOldestDeployed(): this {
    return this.orderBy("deployedAtTimestamp", "asc");
  }

  /**
   * Order paymasters by total deposits (highest first)
   *
   * @returns this for method chaining
   */
  orderByTotalDeposits(): this {
    return this.orderBy("totalUsersDeposit", "desc");
  }

  /**
   * Order paymasters by current deposit (highest first)
   *
   * @returns this for method chaining
   */
  orderByCurrentDeposit(): this {
    return this.orderBy("currentDeposit", "desc");
  }

  /**
   * Order paymasters by revenue (highest first)
   *
   * @returns this for method chaining
   */
  orderByRevenue(): this {
    return this.orderBy("revenue", "desc");
  }

  /**
   * Build GraphQL query string for paymaster contracts
   *
   * @private
   * @param fields - Fields to include in the query
   * @returns GraphQL query string
   */
  private buildPaymasterQuery(fields: PaymasterContractFields[]): string {
    const fieldsList = fields.map((field) => `      ${field}`).join("\n");
    return `
      query GetPaymasterContracts(
        $first: Int!
        $skip: Int!
        $orderBy: PaymasterContract_orderBy
        $orderDirection: OrderDirection
        $where: PaymasterContract_filter
      ) {
        paymasterContracts(
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
   * Execute the query and return paymaster contract results
   *
   * @returns Promise resolving to array of PaymasterContract entities
   */
  async execute(): Promise<PaymasterContract[]> {
    const fields = this.selectedFields || DEFAULT_PAYMASTER_FIELDS;
    const query = this.buildPaymasterQuery(fields);
    const variables = this.buildQueryVariables();

    const response = await this.client.executeQuery<{
      paymasterContracts: PaymasterContract[];
    }>(query, variables);
    return response.paymasterContracts;
  }

  /**
   * Execute the query and return serialized paymaster contract results
   *
   * @returns Promise resolving to array of SerializedPaymasterContract entities
   */
  async executeAndSerialize(): Promise<SerializedPaymasterContract[]> {
    const paymasters = await this.execute();
    return paymasters.map(serializePaymasterContract);
  }

  /**
   * Get paymaster contract with related data included
   *
   * @param includeRelated - Whether to include pools, user operations, and revenue withdrawals
   * @param poolLimit - Maximum number of pools to fetch
   * @param userOpLimit - Maximum number of user operations to fetch
   * @param withdrawalLimit - Maximum number of withdrawals to fetch
   * @returns PaymasterQueryWithRelatedBuilder for extended functionality
   */
  withRelated(
    includeRelated: boolean = true,
    poolLimit: number = 100,
    userOpLimit: number = 100,
    withdrawalLimit: number = 100,
  ): PaymasterQueryWithRelatedBuilder {
    return new PaymasterQueryWithRelatedBuilder(
      this.client,
      this.getConfig(),
      includeRelated,
      poolLimit,
      userOpLimit,
      withdrawalLimit,
    );
  }

  /**
   * Get paymaster contract by address
   *
   * @param address - Contract address
   * @returns Promise resolving to paymaster contract or null if not found
   */
  async getPaymasterByAddress(
    address: string,
  ): Promise<PaymasterContract | null> {
    return await this.byAddress(address).first();
  }

  /**
   * Get all GasLimited paymaster contracts
   *
   * @returns Promise resolving to array of GasLimited paymaster contracts
   */
  async getGasLimitedPaymasters(): Promise<PaymasterContract[]> {
    return await this.byType("GasLimited").execute();
  }

  /**
   * Get all OneTimeUse paymaster contracts
   *
   * @returns Promise resolving to array of OneTimeUse paymaster contracts
   */
  async getOneTimeUsePaymasters(): Promise<PaymasterContract[]> {
    return await this.byType("OneTimeUse").execute();
  }

  /**
   * Check if a paymaster contract exists by address
   *
   * @param address - Contract address to check
   * @returns Promise resolving to true if contract exists, false otherwise
   */
  async paymasterExists(address: string): Promise<boolean> {
    return await this.byAddress(address).exists();
  }

  /**
   * Clone the current query builder
   *
   * @returns New PaymasterContractQueryBuilder instance with same configuration
   */
  clone(): PaymasterContractQueryBuilder {
    const cloned = new PaymasterContractQueryBuilder(this.client);
    cloned.config = { ...this.config };
    cloned.selectedFields = this.selectedFields
      ? [...this.selectedFields]
      : undefined;
    return cloned;
  }
}

/**
 * Extended query builder for paymaster contracts that includes related data
 */
export class PaymasterQueryWithRelatedBuilder extends BaseQueryBuilder<
  PaymasterContract & {
    pools: Pool[];
    userOperations: UserOperation[];
    revenueWithdrawals: RevenueWithdrawal[];
  },
  PaymasterContractFields,
  PaymasterContractWhereInput
> {
  constructor(
    private client: SubgraphClient,
    private baseConfig: any,
    private includeRelated: boolean,
    private poolLimit: number,
    private userOpLimit: number,
    private withdrawalLimit: number,
  ) {
    super();
    this.config = { ...baseConfig };
  }

  /**
   * Build GraphQL query string for paymaster contracts with related data
   *
   * @private
   * @returns GraphQL query string
   */
  private buildPaymasterWithRelatedQuery(): string {
    const relatedFields = this.includeRelated
      ? `
          pools(first: $poolLimit, orderBy: createdAtTimestamp, orderDirection: desc) {
            id
            poolId
            joiningFee
            totalDeposits
            memberCount
            currentMerkleRoot
            createdAtTimestamp
          }
          userOperations(first: $userOpLimit, orderBy: executedAtTimestamp, orderDirection: desc) {
            id
            userOpHash
            sender
            actualGasCost
            nullifier
            executedAtTimestamp
          }
          revenueWithdrawals(first: $withdrawalLimit, orderBy: withdrawnAtTimestamp, orderDirection: desc) {
            id
            recipient
            amount
            withdrawnAtTimestamp
          }`
      : "";

    return `
      query GetPaymasterContractsWithRelated(
        $first: Int!
        $skip: Int!
        $orderBy: PaymasterContract_orderBy
        $orderDirection: OrderDirection
        $where: PaymasterContract_filter
        $poolLimit: Int!
        $userOpLimit: Int!
        $withdrawalLimit: Int!
      ) {
        paymasterContracts(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: $orderDirection
          where: $where
        ) {
          id
          contractType
          address
          totalUsersDeposit
          currentDeposit
          revenue
          deployedAtBlock
          deployedAtTransaction
          deployedAtTimestamp
          lastUpdatedBlock
          lastUpdatedTimestamp${relatedFields}
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
      poolLimit: this.poolLimit,
      userOpLimit: this.userOpLimit,
      withdrawalLimit: this.withdrawalLimit,
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
   * Execute query and return paymaster contracts with related data
   *
   * @returns Promise resolving to paymaster contracts with related data included
   */
  async execute(): Promise<
    (PaymasterContract & {
      pools: Pool[];
      userOperations: UserOperation[];
      revenueWithdrawals: RevenueWithdrawal[];
    })[]
  > {
    const query = this.buildPaymasterWithRelatedQuery();
    const variables = this.buildQueryVariables();

    const response = await this.client.executeQuery<{
      paymasterContracts: (PaymasterContract & {
        pools: Pool[];
        userOperations: UserOperation[];
        revenueWithdrawals: RevenueWithdrawal[];
      })[];
    }>(query, variables);

    return response.paymasterContracts;
  }

  /**
   * Execute query and return serialized paymaster contracts with related data
   *
   * @returns Promise resolving to array of SerializedPaymasterContract entities with related data
   */
  async executeAndSerialize(): Promise<SerializedPaymasterContract[]> {
    const paymastersWithRelated = await this.execute();
    return paymastersWithRelated.map(serializePaymasterContract);
  }

  /**
   * Clone the current query builder
   *
   * @returns New PaymasterQueryWithRelatedBuilder instance with same configuration
   */
  clone(): PaymasterQueryWithRelatedBuilder {
    const cloned = new PaymasterQueryWithRelatedBuilder(
      this.client,
      this.baseConfig,
      this.includeRelated,
      this.poolLimit,
      this.userOpLimit,
      this.withdrawalLimit,
    );
    cloned.config = { ...this.config };
    cloned.selectedFields = this.selectedFields
      ? [...this.selectedFields]
      : undefined;
    return cloned;
  }
}
