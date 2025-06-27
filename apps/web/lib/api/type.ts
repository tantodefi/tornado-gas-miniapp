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
 * API validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Clean HTTP client for frontend API communication
 * Focused only on HTTP concerns, not business logic
 */
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
