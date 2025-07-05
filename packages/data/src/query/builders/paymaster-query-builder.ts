/**
 * Query builder for PaymasterContract entities
 * Updated for the new network-aware schema structure
 */

import type { SubgraphClient } from "../../client/subgraph-client.js";
import type {
  PaymasterContract,
  PaymasterType,
  NetworkName,
  Pool, // Add Pool if you want to include nested Pool data in selected fields
  UserOperation, // Add UserOperation if you want to include nested UserOperation data
  RevenueWithdrawal, // Add RevenueWithdrawal if you want to include nested RevenueWithdrawal data
} from "../../types/subgraph.js";
import { GET_PAYMASTER_WITH_RELATED } from "../../client/queries.js";
import { BaseQueryBuilder } from "./base-query-builder.js";
import {
  PaymasterContractFields,
  PaymasterContractWhereInput,
} from "../types.js";

// Define specific types for PaymasterContractQueryBuilder

export type PaymasterContractOrderBy =
  | "deployedAtTimestamp"
  | "revenue"
  | "currentDeposit"
  | "lastUpdatedTimestamp";

/**
 * Query builder for PaymasterContract entities
 *
 * Provides a fluent interface for building complex paymaster queries
 * with full support for the new network-aware schema.
 */
export class PaymasterContractQueryBuilder extends BaseQueryBuilder<
  PaymasterContract,
  PaymasterContractFields,
  PaymasterContractWhereInput,
  PaymasterContractOrderBy
> {
  constructor(private subgraphClient: SubgraphClient) {
    super(subgraphClient, "paymasterContracts", "deployedAtTimestamp", "desc");
  }
  /**
   * Override default fields for PaymasterContract entity.
   */
  protected getDefaultFields(): string {
    return `
    id
    contractType
    address
    network
    chainId
    totalUsersDeposit
    currentDeposit
    revenue
    deployedAtBlock
    deployedAtTransaction
    deployedAtTimestamp
    lastUpdatedBlock
    lastUpdatedTimestamp
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
   * @returns PaymasterContractQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const paymasters = await client.query().paymasters()
   *   .byNetwork("base-sepolia")
   *   .execute();
   * ```
   */
  byNetwork(network: NetworkName): this {
    this.where({ network: network });
    return this;
  }

  /**
   * Filter by contract type
   *
   * @param type - Paymaster contract type
   * @returns PaymasterContractQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const gasLimitedPaymasters = await client.query().paymasters()
   *   .byNetwork("base-sepolia")
   *   .byType("GasLimited")
   *   .execute();
   * ```
   */
  byType(type: PaymasterType): this {
    this.where({ contractType: type });
    return this;
  }

  /**
   * Filter by contract address
   *
   * @param address - Contract address
   * @returns PaymasterContractQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const paymaster = await client.query().paymasters()
   *   .byNetwork("base-sepolia")
   *   .byAddress("0x3BEeC075aC5A77fFE0F9ee4bbb3DCBd07fA93fbf")
   *   .first();
   * ```
   */
  byAddress(address: string): this {
    this.where({ address: address });
    return this;
  }

  /**
   * Filter by composite ID (network-address)
   * This is for direct lookup of a single paymaster.
   *
   * @param network - Network identifier
   * @param address - Paymaster contract address
   * @returns PaymasterContractQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const paymaster = await client.query().paymasters()
   *   .byId("base-sepolia", "0x3BEeC075aC5A77fFE0F9ee4bbb3DCBd07fA93fbf")
   *   .first();
   * ```
   */
  byId(network: NetworkName, address: string): this {
    this.where({ id: `${network}-${address}` });
    this.byNetwork(network);
    this.byAddress(address);
    return this;
  }
  /**
   * Filter by minimum revenue
   *
   * @param minRevenue - Minimum revenue in wei (as string)
   * @returns PaymasterContractQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const profitablePaymasters = await client.query().paymasters()
   *   .byNetwork("base-sepolia")
   *   .withMinRevenue("1000000000000000000") // 1 ETH
   *   .execute();
   * ```
   */
  withMinRevenue(minRevenue: string): this {
    this.where({ revenue_gte: minRevenue });
    return this;
  }

  /**
   * Filter by maximum revenue
   *
   * @param maxRevenue - Maximum revenue in wei (as string)
   * @returns PaymasterContractQueryBuilder for method chaining
   */
  withMaxRevenue(maxRevenue: string): this {
    this.where({ revenue_lte: maxRevenue });
    return this;
  }

  /**
   * Filter by minimum deposit
   *
   * @param minDeposit - Minimum current deposit in wei (as string)
   * @returns PaymasterContractQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const wellFundedPaymasters = await client.query().paymasters()
   *   .byNetwork("base-sepolia")
   *   .withMinDeposit("5000000000000000000") // 5 ETH
   *   .execute();
   * ```
   */
  withMinDeposit(minDeposit: string): this {
    this.where({ currentDeposit_gte: minDeposit });
    return this;
  }

  /**
   * Filter by maximum deposit
   *
   * @param maxDeposit - Maximum current deposit in wei (as string)
   * @returns PaymasterContractQueryBuilder for method chaining
   */
  withMaxDeposit(maxDeposit: string): this {
    this.where({ currentDeposit_lte: maxDeposit });
    return this;
  }

  /**
   * Filter by deployment date (after)
   *
   * @param timestamp - Timestamp string or number
   * @returns PaymasterContractQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const recentPaymasters = await client.query().paymasters()
   *   .byNetwork("base-sepolia")
   *   .deployedAfter("1704067200") // 2024-01-01
   *   .execute();
   * ```
   */
  deployedAfter(timestamp: string | number): this {
    this.where({ deployedAtTimestamp_gte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by deployment date (before)
   *
   * @param timestamp - Timestamp string or number
   * @returns PaymasterContractQueryBuilder for method chaining
   */
  deployedBefore(timestamp: string | number): this {
    this.where({ deployedAtTimestamp_lte: timestamp.toString() });
    return this;
  }

  /**
   * Filter only active paymasters (positive revenue)
   *
   * @returns PaymasterContractQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const activePaymasters = await client.query().paymasters()
   *   .byNetwork("base-sepolia")
   *   .onlyActive()
   *   .execute();
   * ```
   */
  onlyActive(): this {
    this.where({ revenue_gt: "0" });
    return this;
  }

  /**
   * ========================================
   * ORDERING METHODS
   * ========================================
   */

  /**
   * Order by revenue (highest first)
   *
   * @returns PaymasterContractQueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const topPaymasters = await client.query().paymasters()
   *   .byNetwork("base-sepolia")
   *   .orderByRevenue()
   *   .limit(10)
   *   .execute();
   * ```
   */
  orderByRevenue(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("revenue", direction);
    return this;
  }

  /**
   * Order by current deposit
   *
   * @returns PaymasterContractQueryBuilder for method chaining
   */
  orderByDeposit(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("currentDeposit", direction);
    return this;
  }

  /**
   * Order by deployment date
   *
   * @returns PaymasterContractQueryBuilder for method chaining
   */
  orderByDeployment(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("deployedAtTimestamp", direction);
    return this;
  }

  /**
   * Order by last activity
   *
   * @returns PaymasterContractQueryBuilder for method chaining
   */
  orderByActivity(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("lastUpdatedTimestamp", direction);
    return this;
  }

  /**
   * ========================================
   * SPECIAL QUERIES
   * ========================================
   */

  /**
   * Get paymaster with related data (pools, user operations, withdrawals)
   *
   * @param poolsLimit - Maximum number of pools to fetch
   * @param userOpsLimit - Maximum number of user operations to fetch
   * @param withdrawalsLimit - Maximum number of withdrawals to fetch
   * @returns Promise resolving to paymaster with related data
   */
  async withRelated(
    poolsLimit: number = 10,
    userOpsLimit: number = 10,
    withdrawalsLimit: number = 10,
  ): Promise<
    | (PaymasterContract & {
        pools: any[];
        userOperations: any[];
        revenueWithdrawals: any[];
      })
    | null
  > {
    if (!this.config.where?.address || !this.config.where?.network) {
      throw new Error("Address and network are required for withRelated query");
    }

    const network = this.config.where.network;
    const address = this.config.where.address;
    const id = `${network}-${address}`;

    const result = await this.client.executeQuery<{
      paymasterContract: PaymasterContract & {
        pools: any[];
        userOperations: any[];
        revenueWithdrawals: any[];
      };
    }>(GET_PAYMASTER_WITH_RELATED, {
      id,
      poolsFirst: poolsLimit,
      userOpsFirst: userOpsLimit,
      withdrawalsFirst: withdrawalsLimit,
    });

    return result.paymasterContract || null;
  }
}

/**
 * ========================================
 * CONVENIENCE FUNCTIONS
 * ========================================
 */

/**
 * Get all GasLimited paymasters for a network
 *
 * @param client - SubgraphClient instance
 * @param network - Network identifier
 * @returns Promise resolving to array of GasLimited paymaster contracts
 */
export async function getGasLimitedPaymasters(
  client: SubgraphClient,
  network: NetworkName,
): Promise<PaymasterContract[]> {
  return new PaymasterContractQueryBuilder(client)
    .byNetwork(network)
    .byType("GasLimited")
    .execute();
}

/**
 * Get all OneTimeUse paymasters for a network
 *
 * @param client - SubgraphClient instance
 * @param network - Network identifier
 * @returns Promise resolving to array of OneTimeUse paymaster contracts
 */
export async function getOneTimeUsePaymasters(
  client: SubgraphClient,
  network: NetworkName,
): Promise<PaymasterContract[]> {
  return new PaymasterContractQueryBuilder(client)
    .byNetwork(network)
    .byType("OneTimeUse")
    .execute();
}

/**
 * Get paymaster by address
 *
 * @param client - SubgraphClient instance
 * @param address - Contract address
 * @param network - Network identifier
 * @returns Promise resolving to paymaster contract or null
 */
export async function getPaymasterByAddress(
  client: SubgraphClient,
  address: string,
  network: NetworkName,
): Promise<PaymasterContract | null> {
  return new PaymasterContractQueryBuilder(client)
    .byId(network, address) // Use the new byId method for direct lookup
    .first();
}

/**
 * Check if a paymaster contract exists
 *
 * @param client - SubgraphClient instance
 * @param address - Contract address
 * @param network - Network identifier
 * @returns Promise resolving to true if contract exists
 */
export async function paymasterExists(
  client: SubgraphClient,
  address: string,
  network: NetworkName,
): Promise<boolean> {
  return new PaymasterContractQueryBuilder(client)
    .byId(network, address) // Use the new byId method
    .exists();
}
