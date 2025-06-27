/**
 * API request/response and data fetching type definitions
 * Single source of truth for API communication, pagination, and error handling
 */

/**
 * Standard API response wrapper structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    timestamp: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    requestedFields?: string[];
  };
  meta?: {
    network?: string;
    chainId?: number;
    chainName?: string;
    networkName?: string;
    contracts?: {
      paymaster: string;
      verifier?: string;
    };
    requestId: string;
    processingTime?: number;
    cached?: boolean;
    timestamp?: string;
    poolId?: string;
  };
}

/**
 * API error class structure
 */
export interface ApiError {
  message: string;
  code: string;
  status?: number;
}

/**
 * Pagination options for API requests
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  skip?: number;
  first?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount?: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Query result with status and metadata
 */
export interface QueryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    executionTime: number;
    blockNumber?: bigint;
    fromCache?: boolean;
  };
}

/**
 * Request metadata for tracking and debugging
 */
export interface RequestMetadata {
  requestId: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  method: string;
  url: string;
}

/**
 * Pool query parameters for API requests
 */
export interface PoolQueryParams {
  page?: number;
  limit?: number;
  maxResults?: number;
  paginated?: boolean;
  fields?: string; // Comma-separated field names
}

/**
 * Pool details query parameters
 */
export interface PoolDetailsParams {
  includeMembers?: boolean;
  memberLimit?: number;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  defaultHeaders?: Record<string, string>;
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  cache?: RequestCache;
  signal?: AbortSignal;
}

/**
 * API endpoint configuration
 */
export interface ApiEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  requiresAuth?: boolean;
  cache?: {
    ttl: number;
    key: string;
  };
}

/**
 * Cache configuration for API responses
 */
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  key: string; // Cache key
  strategy: "stale-while-revalidate" | "cache-first" | "network-first";
}

/**
 * API validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * API rate limiting information
 */
export interface RateLimitInfo {
  limit: number; // Requests per window
  remaining: number; // Remaining requests
  reset: number; // Reset timestamp
  window: number; // Window duration in seconds
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  services: {
    subgraph: "healthy" | "unhealthy";
    database?: "healthy" | "unhealthy";
    cache?: "healthy" | "unhealthy";
  };
  responseTime: number;
}

/**
 * Analytics data for API usage
 */
export interface ApiAnalytics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorsByCode: Record<string, number>;
  popularEndpoints: Array<{
    endpoint: string;
    requests: number;
  }>;
}

/**
 * Background job status for long-running operations
 */
export interface JobStatus {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  progress?: number; // 0-100
  startedAt: string;
  completedAt?: string;
  error?: string;
  result?: any;
}

/**
 * WebSocket message structure for real-time updates
 */
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  id: string;
}

/**
 * Subscription configuration for real-time data
 */
export interface SubscriptionConfig {
  endpoint: string;
  topics: string[];
  reconnectAttempts?: number;
  heartbeatInterval?: number;
}

/**
 * Data synchronization status
 */
export interface SyncStatus {
  lastSync: string;
  nextSync: string;
  isSyncing: boolean;
  blocksRemaining?: number;
  syncProgress?: number; // 0-100
}
