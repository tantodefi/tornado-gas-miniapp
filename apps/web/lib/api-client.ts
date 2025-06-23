// lib/api-client.ts
// Centralized API client for consistent error handling and request formatting

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    timestamp?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    requestedFields?: string[];
  };
  meta?: {
    network: string;
    chainId: number;
    chainName: string;
    networkName: string;
    contracts: {
      paymaster: string;
      verifier?: string;
    };
    requestId: string;
    processingTime: number;
    cached?: boolean;
  };
}

export class ApiError extends Error {
  public code: string;
  public status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Parse response
      let data: ApiResponse<T>;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new ApiError(
          "Invalid response format",
          "PARSE_ERROR",
          response.status,
        );
      }

      // Handle HTTP errors
      if (!response.ok) {
        throw new ApiError(
          data.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          data.error?.code || "HTTP_ERROR",
          response.status,
        );
      }

      // Handle API errors
      if (!data.success) {
        throw new ApiError(
          data.error?.message || "API request failed",
          data.error?.code || "API_ERROR",
          response.status,
        );
      }

      return data;
    } catch (error) {
      // Network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new ApiError(
          "Network error: Unable to connect to the server",
          "NETWORK_ERROR",
        );
      }

      // Re-throw ApiError instances
      if (error instanceof ApiError) {
        throw error;
      }

      // Unknown errors
      throw new ApiError(
        error instanceof Error ? error.message : "Unknown error occurred",
        "UNKNOWN_ERROR",
      );
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;

    return this.request<T>(url, {
      method: "GET",
      cache: "no-store", // Always fetch fresh data
    });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// ✅ Updated Pool interface to match actual PoolData from SDK
export interface Pool {
  poolId: string;
  joiningFee: string; // ✅ BigInt string from subgraph
  merkleTreeDuration: string;
  totalDeposits: string;
  currentMerkleTreeRoot: string;
  membersCount: string; // ✅ BigInt string from subgraph
  merkleTreeDepth: string;
  createdAt: string;
  createdAtBlock: string;
  currentRootIndex: number;
  rootHistoryCount: number;

  // ✅ Add network info for UI components
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
}

// ✅ Updated FilterParams to match actual route parameters
export interface PoolFilterParams {
  page?: number;
  limit?: number;
  maxResults?: number;
  paginated?: boolean;
  fields?: string; // Comma-separated field names
}

// ✅ Updated Prepaid Pools API
export const prepaidPoolsApi = {
  // Get all pools with optional filtering
  async getPools(filters?: PoolFilterParams): Promise<{
    pools: Pool[];
    pagination: any;
    meta: any;
  }> {
    const response = await apiClient.get<Pool[]>("/api/prepaid-pools", filters);

    // ✅ Transform pools to include network info from meta
    const transformedPools = (response.data || []).map((pool) => ({
      ...pool,
      network: {
        name: response.meta?.chainName || "Unknown",
        chainId: response.meta?.chainId || 0,
        chainName: response.meta?.chainName || "Unknown",
        networkName: response.meta?.networkName || "Unknown",
        contracts: response.meta?.contracts || { paymaster: "" },
      },
    }));

    return {
      pools: transformedPools,
      pagination: response.pagination || {},
      meta: response.meta || {},
    };
  },

  // Join a pool (future feature)
  async joinPool(
    poolId: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/api/prepaid-pools/${poolId}/join`, // ✅ Correct endpoint
    );

    return {
      success: true,
      message: response.data?.message || "Successfully joined pool",
    };
  },

  // Get pool details
  async getPoolDetails(
    poolId: string,
  ): Promise<Pool & { members: any[]; transactions: any[] }> {
    const response = await apiClient.get<
      Pool & { members: any[]; transactions: any[] }
    >(`/api/prepaid-pools/${poolId}`); // ✅ Correct endpoint

    if (!response.data) {
      throw new ApiError("Pool not found", "POOL_NOT_FOUND", 404);
    }

    return response.data;
  },

  // ✅ New method: Get pools with specific fields
  async getPoolsWithFields(
    fields: string[],
    options?: {
      page?: number;
      limit?: number;
      paginated?: boolean;
    },
  ): Promise<{
    pools: Partial<Pool>[];
    pagination: any;
    meta: any;
  }> {
    const params: PoolFilterParams = {
      fields: fields.join(","),
      ...options,
    };

    const response = await apiClient.get<Partial<Pool>[]>(
      "/api/prepaid-pools",
      params,
    );

    return {
      pools: response.data || [],
      pagination: response.pagination || {},
      meta: response.meta || {},
    };
  },
};

// Export for easier imports
export { ApiClient };
export default apiClient;
