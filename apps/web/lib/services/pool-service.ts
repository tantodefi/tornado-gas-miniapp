import {
  SubgraphClient,
  type Pool,
  serializePool,
  type SerializedPool,
} from "@workspace/data";
import { ClientFactory } from "./client-factory";
import { PoolQueryOptions } from "@/types";

/**
 * Pool service response
 */
export interface PoolServiceResponse<T> {
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    requestedFields?: string[];
  };
  meta: {
    network: string;
    chainId: number;
    chainName: string;
    networkName: string;
    contracts: {
      paymaster: string;
      verifier?: string;
    };
    processingTime: number;
  };
}

/**
 * Service for managing pool operations
 * Handles business logic and data transformations
 */
export class PoolService {
  private client: SubgraphClient;
  private timeout: number;

  constructor(timeout: number = 30000) {
    this.client = ClientFactory.getSubgraphClient();
    this.timeout = timeout;
  }

  /**
   * Get all pools with optional filtering and pagination
   */
  async getAllPools(
    options: PoolQueryOptions = {},
  ): Promise<PoolServiceResponse<SerializedPool[]>> {
    const startTime = Date.now();
    const {
      page = 0,
      limit = 100,
      maxResults,
      paginated = false,
      fields,
    } = options;

    const skip = page * limit;

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), this.timeout);
    });

    let serializedPools: any[];
    let meta: any;

    if (fields && fields.length > 0) {
      // Handle custom field selection
      const dataPromise = async () => {
        return await this.client.getPoolsWithFields(fields, {
          first: limit,
          skip,
        });
      };

      const result = await Promise.race([dataPromise(), timeoutPromise]);
      meta = result.meta;

      // Handle partial pools from field selection
      serializedPools = result.data.map((pool: Partial<Pool>) => ({
        // Convert BigInt fields to strings
        ...Object.fromEntries(
          Object.entries(pool).map(([key, value]) => [
            key,
            typeof value === "bigint" ? value.toString() : value,
          ]),
        ),
        network: {
          name: result.meta.chainName,
          chainId: result.meta.chainId,
          chainName: result.meta.chainName,
          networkName: result.meta.networkName,
          contracts: result.meta.contracts,
        },
      }));
    } else {
      // Handle full pools
      const dataPromise = async () => {
        return await this.client.getAllPools({
          first: maxResults || limit,
          skip: paginated ? 0 : skip,
        });
      };

      const result = await Promise.race([dataPromise(), timeoutPromise]);
      meta = result.meta;

      // Handle full pools with safe serialization
      serializedPools = result.data.map((pool: Pool) => ({
        ...serializePool(pool), // Now handles undefined fields safely
        network: {
          name: result.meta.chainName,
          chainId: result.meta.chainId,
          chainName: result.meta.chainName,
          networkName: result.meta.networkName,
          contracts: result.meta.contracts,
        },
      }));
    }

    return {
      data: serializedPools,
      pagination: {
        page,
        limit,
        total: serializedPools.length,
        hasMore: serializedPools.length === limit,
        requestedFields: fields,
      },
      meta: {
        network: meta.network,
        chainId: meta.chainId,
        chainName: meta.chainName,
        networkName: meta.networkName,
        contracts: meta.contracts,
        processingTime: Date.now() - startTime,
      },
    };
  }

  /**
   * Get detailed pool information with optional members
   */
  async getPoolDetails(
    poolId: string,
    includeMembers: boolean = false,
    memberLimit: number = 100,
  ): Promise<
    PoolServiceResponse<SerializedPool & { members: any[]; rootHistory: any[] }>
  > {
    const startTime = Date.now();

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), this.timeout);
    });

    // Create data promise with new parameters
    const dataPromise = async () => {
      return await this.client.getPoolDetails(
        poolId,
        includeMembers,
        memberLimit,
      );
    };

    // Execute with timeout
    const result = await Promise.race([dataPromise(), timeoutPromise]);

    if (!result.data) {
      throw new Error(`Pool with ID ${poolId} not found`);
    }

    // Transform to serialized format
    const serializedPool = {
      ...serializePool(result.data),
      network: {
        name: result.meta.chainName,
        chainId: result.meta.chainId,
        chainName: result.meta.chainName,
        networkName: result.meta.networkName,
        contracts: result.meta.contracts,
      },
      members: result.data.members || [],
      rootHistory:
        result.data.rootHistory?.map((root) => ({
          id: root.id,
          index: root.index,
          merkleRoot: root.merkleRoot.toString(),
          createdAt: root.createdAt.toString(),
          createdAtBlock: root.createdAtBlock.toString(),
          isValid: root.isValid,
          transactionHash: root.transactionHash,
        })) || [],
    };

    return {
      data: serializedPool,
      pagination: {
        page: 0,
        limit: 1,
        total: 1,
        hasMore: false,
      },
      meta: {
        network: result.meta.network,
        chainId: result.meta.chainId,
        chainName: result.meta.chainName,
        networkName: result.meta.networkName,
        contracts: result.meta.contracts,
        processingTime: Date.now() - startTime,
      },
    };
  }
  /**
   * Validate query parameters
   */
  validateQueryOptions(options: Record<string, any>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const { page, limit, maxResults, fields } = options;

    // Validate page
    if (page !== undefined) {
      const pageNum = parseInt(page, 10);
      if (isNaN(pageNum) || pageNum < 0) {
        errors.push("Page must be a non-negative integer");
      }
    }

    // Validate limit
    if (limit !== undefined) {
      const limitNum = parseInt(limit, 10);
      if (isNaN(limitNum) || limitNum <= 0 || limitNum > 1000) {
        errors.push("Limit must be between 1 and 1000");
      }
    }

    // Validate maxResults
    if (maxResults !== undefined) {
      const maxRes = parseInt(maxResults, 10);
      if (isNaN(maxRes) || maxRes <= 0 || maxRes > 10000) {
        errors.push("MaxResults must be between 1 and 10000");
      }
    }

    // Validate fields
    if (fields !== undefined && typeof fields === "string") {
      const fieldList = fields.split(",").map((f) => f.trim());
      const validFields = [
        "id",
        "poolId",
        "joiningFee",
        "merkleTreeDuration",
        "totalDeposits",
        "currentMerkleTreeRoot",
        "membersCount",
        "merkleTreeDepth",
        "createdAt",
        "createdAtBlock",
        "currentRootIndex",
        "rootHistoryCount",
      ];
      const invalidFields = fieldList.filter((f) => !validFields.includes(f));
      if (invalidFields.length > 0) {
        errors.push(`Invalid fields: ${invalidFields.join(", ")}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
