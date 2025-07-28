import { NextRequest } from "next/server";
import {
  createSuccessResponse,
  createValidationErrorResponse,
  getRequestId,
  handleApiError,
  setCacheHeaders,
} from "@/lib/api/response";
import { SerializedPaymasterContract, SubgraphClient } from "@prepaid-gas/data";

// Environment validation
const CACHE_TTL = parseInt(process.env.POOLS_CACHE_TTL || "300", 10);

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate query parameters
 */
function validateQueryOptions(params: {
  page: string;
  limit: string;
  maxResults?: string;
}): ValidationResult {
  const errors: string[] = [];

  const page = parseInt(params.page, 10);
  const limit = parseInt(params.limit, 10);

  if (isNaN(page) || page < 0) {
    errors.push("Page must be a non-negative number");
  }

  if (isNaN(limit) || limit < 1 || limit > 1000) {
    errors.push("Limit must be between 1 and 1000");
  }

  if (params.maxResults) {
    const maxResults = parseInt(params.maxResults, 10);
    if (isNaN(maxResults) || maxResults < 1) {
      errors.push("maxResults must be a positive number");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * GET /api/prepaid-pools - Get all pools
 * Simplified: No network transformation needed since data package includes network info
 */
export async function GET(request: NextRequest) {
  const requestId = await getRequestId();
  const startTime = Date.now();

  try {
    // During build time, return empty data
    if (!process.env.SUBGRAPH_URL) {
      return createSuccessResponse(
        [],
        { requestId, processingTime: 0, cached: false },
        { page: 0, limit: 100, total: 0, hasMore: false },
        requestId,
      );
    }
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const maxResults = searchParams.get("maxResults")
      ? parseInt(searchParams.get("maxResults")!, 10)
      : undefined;
    const paginated = searchParams.get("paginated") !== "false";

    // Validate parameters
    const validation = validateQueryOptions({
      page: page.toString(),
      limit: limit.toString(),
      maxResults: maxResults?.toString(),
    });

    if (!validation.isValid) {
      return createValidationErrorResponse(validation.errors, requestId);
    }

    // Create client using factory
    const subgraphClient = SubgraphClient.createForNetwork(84532, {
      subgraphUrl: process.env.SUBGRAPH_URL,
    });

    // Calculate skip for pagination
    const skip = paginated ? page * limit : 0;
    const effectiveLimit = maxResults ? Math.min(limit, maxResults) : limit;
    // Build query using the query builder pattern
    let paymasterPoolQuery = subgraphClient
      .query()
      .paymasters()
      .limit(effectiveLimit);

    // Add skip for pagination
    if (skip > 0) {
      paymasterPoolQuery = paymasterPoolQuery.skip(skip);
    }

    // Execute query with timeout and fallback
    let serializedPools: SerializedPaymasterContract[] = [];
    try {
      // Add timeout for subgraph calls
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Subgraph timeout")), 3000),
      );
      const result = await Promise.race([
        paymasterPoolQuery.executeAndSerialize(),
        timeoutPromise,
      ]);

      serializedPools = Array.isArray(result) ? result : [];
    } catch (subgraphError) {
      console.warn(
        "Subgraph query failed, returning empty results:",
        subgraphError,
      );
      serializedPools = [];
    }

    // Construct response metadata using ClientFactory
    const meta = {
      // ...SubgraphClient.getNetworkPreset(84532),
      requestId,
      processingTime: Date.now() - startTime,
      cached: false,
    };

    // Construct pagination info
    const pagination = {
      page,
      limit,
      total: serializedPools.length,
      hasMore: serializedPools.length === limit,
    };

    // Create response - pools already have network info
    const response = createSuccessResponse(
      serializedPools,
      meta,
      pagination,
      requestId,
    );

    // Set caching headers
    setCacheHeaders(response, CACHE_TTL);

    return response;
  } catch (error) {
    return handleApiError(error, requestId);
  }
}

// Enable static generation with revalidation
export const revalidate = 300; // 5 minutes

// Runtime configuration
export const runtime = "nodejs";
export const preferredRegion = "auto";
