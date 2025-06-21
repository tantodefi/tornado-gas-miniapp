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
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    filters?: Record<string, any>;
    timestamp?: string;
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

// Specific API functions
export interface Pool {
  id: string;
  amount: number;
  members: number;
  network: {
    name: string;
    icon: string;
    color: string;
  };
  createdAt?: string;
  status?: "active" | "full" | "low";
}

export interface FilterParams {
  network?: string;
  amountRange?: string;
  memberRange?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

// Prepaid Cards API
export const prepaidCardsApi = {
  // Get all cards with optional filtering
  async getCards(filters?: FilterParams): Promise<{
    pools: Pool[];
    pagination: any;
    meta: any;
  }> {
    const response = await apiClient.get<Pool[]>("/api/prepaid-pools", filters);

    return {
      pools: response.data || [],
      pagination: response.pagination || {},
      meta: response.meta || {},
    };
  },

  // Create a new pool
  async createPool(poolData: {
    amount: number;
    networkId: string;
  }): Promise<Pool> {
    const response = await apiClient.post<Pool>("/api/prepaid-cards", poolData);

    if (!response.data) {
      throw new ApiError("No data returned from create pool", "NO_DATA");
    }

    return response.data;
  },

  // Join a pool (future feature)
  async joinPool(
    poolId: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/api/prepaid-cards/${poolId}/join`,
    );

    return {
      success: true,
      message: response.data?.message || "Successfully joined pool",
    };
  },

  // Get pool details (future feature)
  async getPoolDetails(
    poolId: string,
  ): Promise<Pool & { members: any[]; transactions: any[] }> {
    const response = await apiClient.get<
      Pool & { members: any[]; transactions: any[] }
    >(`/api/prepaid-cards/${poolId}`);

    if (!response.data) {
      throw new ApiError("Pool not found", "POOL_NOT_FOUND", 404);
    }

    return response.data;
  },
};

// Export for easier imports
export { ApiClient };
export default apiClient;
