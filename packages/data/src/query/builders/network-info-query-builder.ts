// network-info-query-builder.ts (Refactored)

import type { SubgraphClient } from "../../client/subgraph-client.js";
import type { NetworkInfo, NetworkName } from "../../types/subgraph.js";
import { NetworkInfoFields, NetworkInfoWhereInput } from "../types.js";
import { BaseQueryBuilder } from "./base-query-builder.js";

export type NetworkInfoOrderBy =
  | "id"
  | "name"
  | "totalPaymasters"
  | "totalPools"
  | "totalMembers"
  | "totalUserOperations"
  | "totalGasSpent"
  | "totalRevenue"
  | "firstDeploymentTimestamp"
  | "lastActivityTimestamp"
  | "chainId";

/**
 * Query builder for NetworkInfo entities
 *
 * Provides a fluent interface for building network information queries
 * with support for network-level statistics and metadata.
 */
export class NetworkInfoQueryBuilder extends BaseQueryBuilder<
  NetworkInfo,
  NetworkInfoFields,
  NetworkInfoWhereInput,
  NetworkInfoOrderBy
> {
  constructor(private subgraphClient: SubgraphClient) {
    super(subgraphClient, "networkInfos", "name", "asc"); // Default order by name, ascending
  }

  /**
   * Override default fields for NetworkInfo entity.
   */
  protected getDefaultFields(): string {
    return `
      id
      name
      chainId
      rpcUrl
      explorerUrl
      totalPaymasters
      totalPools
      totalMembers
      totalUserOperations
      totalGasSpent
      totalRevenue
      firstDeploymentTimestamp
      lastActivityTimestamp
    `;
  }

  /**
   * ========================================
   * FILTERING METHODS
   * ========================================
   */

  /**
   * Filter by a specific network.
   *
   * @param network - Network identifier (e.g., "base-sepolia").
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const networkInfo = await client.query().networkInfo()
   * .byNetwork("base-sepolia")
   * .execute();
   * ```
   */
  byNetwork(network: NetworkName): this {
    this.where({ id: network });
    return this;
  }

  /**
   * Filter by minimum number of paymasters.
   *
   * @param minPaymasters - Minimum number of paymasters.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const activeNetworks = await client.query().networkInfo()
   * .withMinPaymasters(1)
   * .execute();
   * ```
   */
  withMinPaymasters(minPaymasters: number): this {
    this.where({ totalPaymasters_gte: minPaymasters.toString() });
    return this;
  }

  /**
   * Filter by maximum number of paymasters.
   *
   * @param maxPaymasters - Maximum number of paymasters.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const smallNetworks = await client.query().networkInfo()
   * .withMaxPaymasters(5)
   * .execute();
   * ```
   */
  withMaxPaymasters(maxPaymasters: number): this {
    this.where({ totalPaymasters_lte: maxPaymasters.toString() });
    return this;
  }

  /**
   * Filter by minimum number of pools.
   *
   * @param minPools - Minimum number of pools.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const networksWithPools = await client.query().networkInfo()
   * .withMinPools(5)
   * .execute();
   * ```
   */
  withMinPools(minPools: number): this {
    this.where({ totalPools_gte: minPools.toString() });
    return this;
  }

  /**
   * Filter by maximum number of pools.
   *
   * @param maxPools - Maximum number of pools.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const lessActivePools = await client.query().networkInfo()
   * .withMaxPools(10)
   * .execute();
   * ```
   */
  withMaxPools(maxPools: number): this {
    this.where({ totalPools_lte: maxPools.toString() });
    return this;
  }

  /**
   * Filter by minimum number of members.
   *
   * @param minMembers - Minimum number of members.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const popularNetworks = await client.query().networkInfo()
   * .withMinMembers(100)
   * .execute();
   * ```
   */
  withMinMembers(minMembers: number): this {
    this.where({ totalMembers_gte: minMembers.toString() });
    return this;
  }

  /**
   * Filter by maximum number of members.
   *
   * @param maxMembers - Maximum number of members.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const lessPopulatedNetworks = await client.query().networkInfo()
   * .withMaxMembers(500)
   * .execute();
   * ```
   */
  withMaxMembers(maxMembers: number): this {
    this.where({ totalMembers_lte: maxMembers.toString() });
    return this;
  }

  /**
   * Filter by minimum number of user operations.
   *
   * @param minUserOperations - Minimum number of user operations.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const activeNetworks = await client.query().networkInfo()
   * .withMinUserOperations(1000)
   * .execute();
   * ```
   */
  withMinUserOperations(minUserOperations: number): this {
    this.where({ totalUserOperations_gte: minUserOperations.toString() });
    return this;
  }

  /**
   * Filter by maximum number of user operations.
   *
   * @param maxUserOperations - Maximum number of user operations.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const lowTrafficNetworks = await client.query().networkInfo()
   * .withMaxUserOperations(5000)
   * .execute();
   * ```
   */
  withMaxUserOperations(maxUserOperations: number): this {
    this.where({ totalUserOperations_lte: maxUserOperations.toString() });
    return this;
  }

  /**
   * Filter by minimum gas spent.
   *
   * @param minGasSpent - Minimum gas spent in wei (as string) (e.g., "10000000000000000000" for 10 ETH).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const highUsageNetworks = await client.query().networkInfo()
   * .withMinGasSpent("10000000000000000000") // 10 ETH
   * .execute();
   * ```
   */
  withMinGasSpent(minGasSpent: string): this {
    this.where({ totalGasSpent_gte: minGasSpent });
    return this;
  }

  /**
   * Filter by maximum gas spent.
   *
   * @param maxGasSpent - Maximum gas spent in wei (as string).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const lowCostNetworks = await client.query().networkInfo()
   * .withMaxGasSpent("100000000000000000") // 0.1 ETH
   * .execute();
   * ```
   */
  withMaxGasSpent(maxGasSpent: string): this {
    this.where({ totalGasSpent_lte: maxGasSpent });
    return this;
  }

  /**
   * Filter by minimum revenue.
   *
   * @param minRevenue - Minimum revenue in wei (as string) (e.g., "1000000000000000000" for 1 ETH).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const profitableNetworks = await client.query().networkInfo()
   * .withMinRevenue("1000000000000000000") // 1 ETH
   * .execute();
   * ```
   */
  withMinRevenue(minRevenue: string): this {
    this.where({ totalRevenue_gte: minRevenue });
    return this;
  }

  /**
   * Filter by maximum revenue.
   *
   * @param maxRevenue - Maximum revenue in wei (as string).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const lessProfitableNetworks = await client.query().networkInfo()
   * .withMaxRevenue("500000000000000000") // 0.5 ETH
   * .execute();
   * ```
   */
  withMaxRevenue(maxRevenue: string): this {
    this.where({ totalRevenue_lte: maxRevenue });
    return this;
  }

  /**
   * Filter by deployment date (after a specific timestamp).
   *
   * @param timestamp - Timestamp string or number (e.g., "1704067200" for 2024-01-01).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const recentNetworks = await client.query().networkInfo()
   * .deployedAfter("1704067200") // 2024-01-01
   * .execute();
   * ```
   */
  deployedAfter(timestamp: string | number): this {
    this.where({ firstDeploymentTimestamp_gte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by deployment date (before a specific timestamp).
   *
   * @param timestamp - Timestamp string or number.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const olderNetworks = await client.query().networkInfo()
   * .deployedBefore("1672531200") // 2023-01-01
   * .execute();
   * ```
   */
  deployedBefore(timestamp: string | number): this {
    this.where({ firstDeploymentTimestamp_lte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by last activity date (after a specific timestamp).
   *
   * @param timestamp - Timestamp string or number (e.g., "1704067200" for recently active).
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const activeNetworks = await client.query().networkInfo()
   * .activeAfter("1704067200") // Recently active
   * .execute();
   * ```
   */
  activeAfter(timestamp: string | number): this {
    this.where({ lastActivityTimestamp_gte: timestamp.toString() });
    return this;
  }

  /**
   * Filter by last activity date (before a specific timestamp).
   *
   * @param timestamp - Timestamp string or number.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const inactiveNetworks = await client.query().networkInfo()
   * .activeBefore("1672531200") // Inactive before 2023-01-01
   * .execute();
   * ```
   */
  activeBefore(timestamp: string | number): this {
    this.where({ lastActivityTimestamp_lte: timestamp.toString() });
    return this;
  }

  /**
   * ========================================
   * ORDERING METHODS (Convenience methods, inherited from BaseQueryBuilder)
   * ========================================
   */

  /**
   * Order results by the total number of paymasters.
   *
   * @param direction - Sort direction, "desc" for most paymasters first (default), "asc" for fewest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const networksByPaymasters = await client.query().networkInfo()
   * .orderByPaymasters("desc")
   * .limit(5)
   * .execute();
   * ```
   */
  orderByPaymasters(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalPaymasters", direction);
    return this;
  }

  /**
   * Order results by the total number of pools.
   *
   * @param direction - Sort direction, "desc" for most pools first (default), "asc" for fewest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const networksByPools = await client.query().networkInfo()
   * .orderByPools("desc")
   * .execute();
   * ```
   */
  orderByPools(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalPools", direction);
    return this;
  }

  /**
   * Order results by the total number of members.
   *
   * @param direction - Sort direction, "desc" for most members first (default), "asc" for fewest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const networksByMembers = await client.query().networkInfo()
   * .orderByMembers("desc")
   * .execute();
   * ```
   */
  orderByMembers(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalMembers", direction);
    return this;
  }

  /**
   * Order results by the total number of user operations.
   *
   * @param direction - Sort direction, "desc" for most user operations first (default), "asc" for fewest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const networksByUserOps = await client.query().networkInfo()
   * .orderByUserOperations("desc")
   * .execute();
   * ```
   */
  orderByUserOperations(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalUserOperations", direction);
    return this;
  }

  /**
   * Order results by the total gas spent.
   *
   * @param direction - Sort direction, "desc" for most gas spent first (default), "asc" for least.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const networksByGas = await client.query().networkInfo()
   * .orderByGasSpent("desc")
   * .execute();
   * ```
   */
  orderByGasSpent(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalGasSpent", direction);
    return this;
  }

  /**
   * Order results by the total revenue.
   *
   * @param direction - Sort direction, "desc" for most revenue first (default), "asc" for least.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const networksByRevenue = await client.query().networkInfo()
   * .orderByRevenue("desc")
   * .execute();
   * ```
   */
  orderByRevenue(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("totalRevenue", direction);
    return this;
  }

  /**
   * Order results by deployment date.
   *
   * @param direction - Sort direction, "desc" for newest deployed first (default), "asc" for oldest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const networksByDeployment = await client.query().networkInfo()
   * .orderByDeployment("desc")
   * .execute();
   * ```
   */
  orderByDeployment(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("firstDeploymentTimestamp", direction);
    return this;
  }

  /**
   * Order results by last activity date.
   *
   * @param direction - Sort direction, "desc" for most recently active first (default), "asc" for least.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const networksByActivity = await client.query().networkInfo()
   * .orderByActivity("desc")
   * .execute();
   * ```
   */
  orderByActivity(direction: "asc" | "desc" = "desc"): this {
    this.orderBy("lastActivityTimestamp", direction);
    return this;
  }

  /**
   * Order results by chain ID.
   *
   * @param direction - Sort direction, "asc" for lowest chain ID first (default), "desc" for highest.
   * @returns The current query builder instance for chaining.
   *
   * @example
   * ```typescript
   * const networksByChainId = await client.query().networkInfo()
   * .orderByChainId("asc")
   * .execute();
   * ```
   */
  orderByChainId(direction: "asc" | "desc" = "asc"): this {
    this.orderBy("chainId", direction);
    return this;
  }

  /**
   * ========================================
   * ANALYTICS METHODS
   * ========================================
   */

  /**
   * Get an overall summary of network statistics based on the current query configuration.
   *
   * @returns A promise resolving to an object containing aggregated network statistics.
   *
   * @example
   * ```typescript
   * const stats = await client.query().networkInfo()
   * .getNetworkStatistics();
   * console.log(stats);
   * ```
   */
  async getNetworkStatistics(): Promise<{
    totalNetworks: number;
    totalPaymasters: string;
    totalPools: string;
    totalMembers: string;
    totalUserOperations: string;
    totalGasSpent: string;
    totalRevenue: string;
    mostActiveNetwork: string;
    mostProfitableNetwork: string;
  }> {
    const networks = await this.execute();

    const totalNetworks = networks.length;
    const totalPaymasters = networks.reduce(
      (sum, network) => sum + BigInt(network.totalPaymasters),
      0n,
    );
    const totalPools = networks.reduce(
      (sum, network) => sum + BigInt(network.totalPools),
      0n,
    );
    const totalMembers = networks.reduce(
      (sum, network) => sum + BigInt(network.totalMembers),
      0n,
    );
    const totalUserOperations = networks.reduce(
      (sum, network) => sum + BigInt(network.totalUserOperations),
      0n,
    );
    const totalGasSpent = networks.reduce(
      (sum, network) => sum + BigInt(network.totalGasSpent),
      0n,
    );
    const totalRevenue = networks.reduce(
      (sum, network) => sum + BigInt(network.totalRevenue),
      0n,
    );

    // Find most active network (by user operations)
    const mostActiveNetwork =
      networks.length > 0
        ? networks.reduce((most, network) =>
            BigInt(network.totalUserOperations) >
            BigInt(most.totalUserOperations)
              ? network
              : most,
          )
        : undefined;

    // Find most profitable network (by revenue)
    const mostProfitableNetwork =
      networks.length > 0
        ? networks.reduce((most, network) =>
            BigInt(network.totalRevenue) > BigInt(most.totalRevenue)
              ? network
              : most,
          )
        : undefined;

    return {
      totalNetworks,
      totalPaymasters: totalPaymasters.toString(),
      totalPools: totalPools.toString(),
      totalMembers: totalMembers.toString(),
      totalUserOperations: totalUserOperations.toString(),
      totalGasSpent: totalGasSpent.toString(),
      totalRevenue: totalRevenue.toString(),
      mostActiveNetwork: mostActiveNetwork?.name || "N/A",
      mostProfitableNetwork: mostProfitableNetwork?.name || "N/A",
    };
  }

  /**
   * Get comparative data for networks based on the current query configuration.
   * Includes metrics like average revenue per paymaster, average members per pool, and utilization rate.
   *
   * @returns A promise resolving to an array of network comparison data objects.
   *
   * @example
   * ```typescript
   * const comparisonData = await client.query().networkInfo()
   * .getNetworkComparison();
   * console.log(comparisonData[0]); // { networkName: "...", totalRevenue: "...", avgRevenuePerPaymaster: "..." }
   * ```
   */
  async getNetworkComparison(): Promise<
    Array<{
      networkName: string;
      chainId: string;
      totalPaymasters: string;
      totalPools: string;
      totalMembers: string;
      totalUserOperations: string;
      totalGasSpent: string;
      totalRevenue: string;
      avgRevenuePerPaymaster: string;
      avgMembersPerPool: string;
      utilizationRate: string;
    }>
  > {
    const networks = await this.execute();

    return networks.map((network) => {
      const totalPaymasters = BigInt(network.totalPaymasters);
      const totalPools = BigInt(network.totalPools);
      const totalMembers = BigInt(network.totalMembers);
      const totalUserOperations = BigInt(network.totalUserOperations);
      const totalRevenue = BigInt(network.totalRevenue);

      const avgRevenuePerPaymaster =
        totalPaymasters > 0n ? totalRevenue / totalPaymasters : 0n;
      const avgMembersPerPool =
        totalPools > 0n ? totalMembers / totalPools : 0n;
      // Utilization rate calculation: (total user operations * 100) / total members
      const utilizationRate =
        totalMembers > 0n ? (totalUserOperations * 100n) / totalMembers : 0n;

      return {
        networkName: network.name,
        chainId: network.chainId.toString(),
        totalPaymasters: totalPaymasters.toString(),
        totalPools: totalPools.toString(),
        totalMembers: totalMembers.toString(),
        totalUserOperations: totalUserOperations.toString(),
        totalGasSpent: network.totalGasSpent.toString(),
        totalRevenue: totalRevenue.toString(),
        avgRevenuePerPaymaster: avgRevenuePerPaymaster.toString(),
        avgMembersPerPool: avgMembersPerPool.toString(),
        utilizationRate: utilizationRate.toString(),
      };
    });
  }
}

/**
 * ========================================
 * CONVENIENCE FUNCTIONS (Updated to use new NetworkInfoQueryBuilder)
 * ========================================
 */

/**
 * Get information for a specific network by its name.
 *
 * @param client - The SubgraphClient instance.
 * @param network - The network identifier (e.g., "base-sepolia").
 * @returns A promise resolving to the NetworkInfo entity for the specified network, or null if not found.
 *
 * @example
 * ```typescript
 * const baseSepoliaInfo = await getNetworkInfo(client, "base-sepolia");
 * if (baseSepoliaInfo) {
 * console.log(`Total Paymasters on Base Sepolia: ${baseSepoliaInfo.totalPaymasters}`);
 * }
 * ```
 */
export async function getNetworkInfo(
  client: SubgraphClient,
  network: NetworkName,
): Promise<NetworkInfo | null> {
  return new NetworkInfoQueryBuilder(client).byNetwork(network).first();
}

/**
 * Get information for all available networks.
 * Results are ordered by chain ID in ascending order by default.
 *
 * @param client - The SubgraphClient instance.
 * @returns A promise resolving to an array of NetworkInfo entities for all networks.
 *
 * @example
 * ```typescript
 * const allNetworks = await getAllNetworkInfo(client);
 * allNetworks.forEach(net => console.log(`${net.name}: Paymasters: ${net.totalPaymasters}`));
 * ```
 */
export async function getAllNetworkInfo(
  client: SubgraphClient,
): Promise<NetworkInfo[]> {
  return new NetworkInfoQueryBuilder(client).orderByChainId().execute();
}

/**
 * Get networks that have shown recent activity within a specified timeframe.
 *
 * @param client - The SubgraphClient instance.
 * @param hoursAgo - The number of hours to look back for activity (default is 24 hours).
 * @returns A promise resolving to an array of NetworkInfo entities for active networks.
 *
 * @example
 * ```typescript
 * const recentlyActive = await getActiveNetworks(client, 12); // Get networks active in the last 12 hours
 * recentlyActive.forEach(net => console.log(`${net.name} was last active at ${new Date(Number(net.lastActivityTimestamp) * 1000)}`));
 * ```
 */
export async function getActiveNetworks(
  client: SubgraphClient,
  hoursAgo: number = 24,
): Promise<NetworkInfo[]> {
  const timestamp = Math.floor(Date.now() / 1000) - hoursAgo * 3600;

  return new NetworkInfoQueryBuilder(client)
    .activeAfter(timestamp)
    .orderByActivity()
    .execute();
}

/**
 * Get an overall statistics summary across all networks.
 * This includes total networks, total paymasters, pools, members, user operations, gas spent, and revenue,
 * along with identifying the most active and most profitable networks.
 *
 * @param client - The SubgraphClient instance.
 * @returns A promise resolving to an object containing aggregated network statistics.
 *
 * @example
 * ```typescript
 * const overallStats = await getNetworkStatistics(client);
 * console.log(`Total User Operations across all networks: ${overallStats.totalUserOperations}`);
 * console.log(`Most Active Network: ${overallStats.mostActiveNetwork}`);
 * ```
 */
export async function getNetworkStatistics(client: SubgraphClient): Promise<{
  totalNetworks: number;
  totalPaymasters: string;
  totalPools: string;
  totalMembers: string;
  totalUserOperations: string;
  totalGasSpent: string;
  totalRevenue: string;
  mostActiveNetwork: string;
  mostProfitableNetwork: string;
}> {
  return new NetworkInfoQueryBuilder(client).getNetworkStatistics();
}
