//file:prepaid-gas-website/apps/web/lib/api/api-client.ts
import { ApiError, ApiResponse } from "./type";

/**
 * Clean HTTP client - only handles HTTP communication
 */
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

/**
 * Pool query parameters for frontend
 */
export interface PoolQueryParams {
  page?: number;
  limit?: number;
  maxResults?: number;
  paginated?: boolean;
  fields?: string; // Comma-separated field names
}

/**
 * Simple frontend API helpers - just HTTP calls, no business logic
 */
export const prepaidPoolsApi = {
  /**
   * Get all pools - simple HTTP call
   */
  async getPools(params?: PoolQueryParams) {
    return apiClient.get("/api/prepaid-pools", params);
  },

  /**
   * Get pool details - simple HTTP call
   */
  async getPoolDetails(
    poolId: string,
    includeMembers: boolean = true,
    memberLimit: number = 100,
  ) {
    return apiClient.get(`/api/prepaid-pools/${poolId}`, {
      includeMembers: includeMembers.toString(),
      memberLimit: memberLimit.toString(),
    });
  },
};

// Export for easier imports
export { ApiClient };
export default apiClient;
