import { GraphQLClient } from "graphql-request";
import type {
  Pool,
  PoolMember,
  MerkleRootHistory,
  NetworkMetadata,
  SubgraphResponse,
} from "../types/subgraph.js";
import {
  GET_POOLS_BY_IDENTITY,
  GET_POOL_MEMBERS,
  GET_VALID_ROOT_INDICES,
  FIND_ROOT_INDEX,
  GET_POOL_ROOT_HISTORY,
  GET_ALL_POOLS,
  GET_POOL_DETAILS,
  buildPoolsQuery,
} from "./queries.js";
import {
  getValidatedNetworkPreset,
  NETWORK_PRESETS,
  type NetworkPreset,
} from "../network/presets.js";

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
 * Simplified root history item (without full pool reference)
 */
export interface RootHistoryItem {
  index: number;
  merkleRoot: string;
  createdAt: string;
  createdAtBlock: string;
  isValid?: boolean;
}

/**
 * Raw GraphQL response types (as returned by subgraph)
 */
interface PoolsByIdentityResponse {
  poolMembers: Array<{
    id: string;
    identityCommitment: string;
    memberIndex: string;
    joinedAt: string;
    joinedAtBlock: string;
    isActive: boolean;
    pool: Pool;
  }>;
}

interface PoolMembersResponse {
  poolMembers: PoolMember[];
}

interface ValidRootIndicesResponse {
  pool: {
    id: string;
    currentRootIndex: number;
    rootHistoryCount: number;
    rootHistory: RootHistoryItem[];
  } | null;
}

interface RootIndexResponse {
  merkleRootHistories: Array<{
    index: number;
    merkleRoot: string;
    createdAt: string;
    isValid: boolean;
  }>;
}

interface PoolDetailsResponse {
  pool:
    | (Pool & {
        members: PoolMember[];
        rootHistory: MerkleRootHistory[];
      })
    | null;
}

interface PoolsResponse {
  pools: Pool[];
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
   * Get all pools where an identity is a member
   */
  async getPoolsByIdentity(
    identityCommitment: string,
    options: PaginationOptions = {},
  ): Promise<SubgraphResponse<Array<{ member: PoolMember; pool: Pool }>>> {
    const { first = 100, skip = 0 } = options;

    const response = await this.client.request<PoolsByIdentityResponse>(
      GET_POOLS_BY_IDENTITY,
      { identityCommitment, first, skip },
    );

    const data = response.poolMembers.map((item) => ({
      member: {
        id: item.id,
        identityCommitment: item.identityCommitment,
        memberIndex: item.memberIndex,
        joinedAt: item.joinedAt,
        joinedAtBlock: item.joinedAtBlock,
        isActive: item.isActive,
        pool: item.pool,
      },
      pool: item.pool,
    }));

    return {
      data,
      meta: this.networkMetadata,
    };
  }

  /**
   * Get all members of a specific pool
   */
  async getPoolMembers(
    poolId: string,
    options: PaginationOptions = {},
  ): Promise<SubgraphResponse<PoolMember[]>> {
    const { first = 100, skip = 0 } = options;

    const response = await this.client.request<PoolMembersResponse>(
      GET_POOL_MEMBERS,
      { poolId, first, skip },
    );

    return {
      data: response.poolMembers,
      meta: this.networkMetadata,
    };
  }

  /**
   * Get valid root indices for a pool
   */
  async getValidRootIndices(poolId: string): Promise<RootHistoryItem[]> {
    const response = await this.client.request<ValidRootIndicesResponse>(
      GET_VALID_ROOT_INDICES,
      { poolId },
    );

    return response.pool?.rootHistory || [];
  }

  /**
   * Find the index for a specific merkle root
   */
  async findRootIndex(
    poolId: string,
    merkleRoot: string,
  ): Promise<{ index: number; merkleRoot: string } | null> {
    const response = await this.client.request<RootIndexResponse>(
      FIND_ROOT_INDEX,
      { poolId, merkleRoot },
    );

    const result = response.merkleRootHistories[0];
    return result
      ? {
          index: result.index,
          merkleRoot: result.merkleRoot,
        }
      : null;
  }

  /**
   * Get root history for a pool
   */
  async getPoolRootHistory(
    poolId: string,
    options: PaginationOptions = {},
  ): Promise<SubgraphResponse<MerkleRootHistory[]>> {
    const { first = 100, skip = 0 } = options;

    const response = await this.client.request<{
      merkleRootHistories: MerkleRootHistory[];
    }>(GET_POOL_ROOT_HISTORY, { poolId, first, skip });

    return {
      data: response.merkleRootHistories,
      meta: this.networkMetadata,
    };
  }

  /**
   * Get all pools
   */
  async getAllPools(
    options: PaginationOptions = {},
  ): Promise<SubgraphResponse<Pool[]>> {
    const { first = 100, skip = 0 } = options;

    const response = await this.client.request<PoolsResponse>(GET_ALL_POOLS, {
      first,
      skip,
    });

    return {
      data: response.pools,
      meta: this.networkMetadata,
    };
  }

  /**
   * Get pools with specific field selection
   */
  async getPoolsWithFields(
    fields: string[],
    options: PaginationOptions = {},
  ): Promise<SubgraphResponse<Partial<Pool>[]>> {
    const { first = 100, skip = 0 } = options;

    const query = buildPoolsQuery(fields);
    const response = await this.client.request<PoolsResponse>(query, {
      first,
      skip,
    });

    return {
      data: response.pools,
      meta: this.networkMetadata,
    };
  }

  /**
   * Get detailed pool information with optional members
   * @param poolId - Pool ID to fetch
   * @param includeMembers - Whether to include members list (default: false)
   * @param memberLimit - Maximum members to fetch when includeMembers=true (default: 100)
   */
  async getPoolDetails(
    poolId: string,
    includeMembers: boolean = false,
    memberLimit: number = 100,
  ): Promise<
    SubgraphResponse<
      Pool & {
        members: PoolMember[];
        rootHistory: MerkleRootHistory[];
      }
    >
  > {
    const response = await this.client.request<PoolDetailsResponse>(
      GET_POOL_DETAILS,
      {
        poolId,
        includeMembers,
        memberLimit,
      },
    );

    if (!response.pool) {
      throw new Error(`Pool with ID ${poolId} not found`);
    }

    return {
      data: response.pool,
      meta: this.networkMetadata,
    };
  }

  /**
   * Get current network metadata
   */
  getNetworkMetadata(): NetworkMetadata {
    return this.networkMetadata;
  }
}
