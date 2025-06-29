import { GraphQLClient } from "graphql-request";
import type { NetworkMetadata } from "../types/subgraph.js";
import {
  getValidatedNetworkPreset,
  NETWORK_PRESETS,
  type NetworkPreset,
} from "../network/presets.js";
import { QueryBuilder } from "../query/query-builder.js";

/**
 * Configuration for the subgraph client
 */
export interface SubgraphClientConfig {
  /** Subgraph endpoint URL */
  subgraphUrl: string;
  /** Network information */
  network: {
    name: string;
    chainId: number;
    chainName: string;
    networkName: string;
    contracts: {
      paymaster: string;
      verifier?: string;
    };
  };
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Pagination options for queries
 */
export interface PaginationOptions {
  /** Number of items to fetch (default: 100) */
  first?: number;
  /** Number of items to skip (default: 0) */
  skip?: number;
}

/**
 * Options for pool queries with field selection
 */
export interface PoolQueryOptions extends PaginationOptions {
  /** Specific fields to fetch */
  fields?: string[];
}

/**
 * Clean, focused subgraph client for data access
 * Handles GraphQL communication and basic data transformation
 */
export class SubgraphClient {
  private client: GraphQLClient;
  private networkMetadata: NetworkMetadata;

  constructor(config: SubgraphClientConfig) {
    // GraphQLClient constructor only takes URL and headers
    this.client = new GraphQLClient(config.subgraphUrl);

    this.networkMetadata = {
      network: config.network.name,
      chainId: config.network.chainId,
      chainName: config.network.chainName,
      networkName: config.network.networkName,
      contracts: config.network.contracts,
    };
  }

  /**
   * Create SubgraphClient for a specific network using presets
   *
   * @param chainId - The chain ID to create client for
   * @param options - Optional configuration overrides
   * @returns Configured SubgraphClient instance
   *
   * @example
   * ```typescript
   * // Create for Base Sepolia using preset
   * const client = SubgraphClient.createForNetwork(84532);
   *
   * // Create with custom subgraph URL override
   * const client = SubgraphClient.createForNetwork(84532, {
   *   subgraphUrl: "https://custom-subgraph.com",
   *   timeout: 60000
   * });
   * ```
   */
  static createForNetwork(
    chainId: number,
    options: {
      /** Custom subgraph URL (optional, uses preset default if not provided) */
      subgraphUrl?: string;
      /** Request timeout in milliseconds */
      timeout?: number;
    } = {},
  ): SubgraphClient {
    const preset = getValidatedNetworkPreset(chainId);

    return new SubgraphClient({
      subgraphUrl: options.subgraphUrl || preset.defaultSubgraphUrl,
      network: preset.network,
      timeout: options.timeout,
    });
  }

  /**
   * Get all supported networks
   *
   * @returns Array of all supported network presets
   *
   * @example
   * ```typescript
   * const networks = SubgraphClient.getSupportedNetworks();
   * console.log(networks.map(n => n.network.chainName)); // ["Base Sepolia", "Base Mainnet"]
   * ```
   */
  static getSupportedNetworks(): NetworkPreset[] {
    return Object.values(NETWORK_PRESETS);
  }

  /**
   * Check if a chain ID is supported
   *
   * @param chainId - The chain ID to check
   * @returns True if supported, false otherwise
   *
   * @example
   * ```typescript
   * if (SubgraphClient.isNetworkSupported(84532)) {
   *   const client = SubgraphClient.createForNetwork(84532);
   * }
   * ```
   */
  static isNetworkSupported(chainId: number): boolean {
    return chainId in NETWORK_PRESETS;
  }

  /**
   * ✨ NEW: Create a fluent query builder instance
   *
   * This is the main entry point for the new query builder API.
   * Provides a fluent interface for building complex queries with type safety.
   *
   * @returns QueryBuilder for fluent query building
   *
   * @example
   * ```typescript
   * // Simple pool query
   * const pools = await client
   *   .query()
   *   .pools()
   *   .withMinMembers(10)
   *   .orderByPopularity()
   *   .limit(20)
   *   .execute();
   *
   * // Complex member query with field selection
   * const members = await client
   *   .query()
   *   .members()
   *   .inPool("1")
   *   .select("identityCommitment", "joinedAt", "memberIndex")
   *   .activeOnly()
   *   .orderByNewestJoined()
   *   .limit(50)
   *   .execute();
   *
   * // Convenience methods
   * const popularPools = await client.query().getPopularPools(15, 10);
   * const stats = await client.query().getPoolStats();
   * ```
   */
  query(): QueryBuilder {
    return new QueryBuilder(this);
  }

  /**
   * Get current network metadata
   */
  getNetworkMetadata(): NetworkMetadata {
    return this.networkMetadata;
  }

  /**
   *
   * This method provides a generic interface for executing any GraphQL query,
   * allowing query builders to construct their own queries while still
   * benefiting from the client's network and error handling.
   *
   * @template T - The expected response type
   * @param query - GraphQL query string
   * @param variables - Query variables object
   * @returns Promise resolving to the query response data
   *
   * @example
   * ```typescript
   * const response = await client.executeQuery<{ pools: Pool[] }>(
   *   'query GetPools($first: Int!) { pools(first: $first) { id poolId } }',
   *   { first: 10 }
   * );
   * console.log(response.pools);
   * ```
   */
  async executeQuery<T = any>(
    query: string,
    variables: Record<string, any> = {},
  ): Promise<T> {
    try {
      const response = await this.client.request<T>(query, variables);
      return response;
    } catch (error) {
      // TODO: Add proper error handling and logging in future iterations
      console.error("GraphQL query failed:", error);
      throw error;
    }
  }
}
