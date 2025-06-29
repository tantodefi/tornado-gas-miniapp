import { NextRequest } from "next/server";
import { PoolFields } from "@workspace/data";
import { ClientFactory } from "@/lib/services/client-factory";
import { CACHE_CONFIG } from "@/constants/network";
import {
  createSuccessResponse,
  createValidationErrorResponse,
  getRequestId,
  handleApiError,
  setCacheHeaders,
} from "@/lib/api/response";

// Environment validation
const CACHE_TTL = CACHE_CONFIG.POOLS_TTL;

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
  fields?: string;
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

  if (params.fields) {
    const fields = params.fields.split(",").map((f) => f.trim());
    const validFields: PoolFields[] = [
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

    const invalidFields = fields.filter(
      (field) => !validFields.includes(field as PoolFields),
    );
    if (invalidFields.length > 0) {
      errors.push(`Invalid fields: ${invalidFields.join(", ")}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function GET(request: NextRequest) {
  const requestId = await getRequestId();
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const maxResults = searchParams.get("maxResults")
      ? parseInt(searchParams.get("maxResults")!, 10)
      : undefined;
    const paginated = searchParams.get("paginated") !== "false";
    const fieldsParam = searchParams.get("fields");
    const fields = fieldsParam
      ? (fieldsParam.split(",").map((f) => f.trim()) as PoolFields[])
      : undefined;

    // Validate parameters
    const validation = validateQueryOptions({
      page: page.toString(),
      limit: limit.toString(),
      maxResults: maxResults?.toString(),
      fields: fieldsParam ?? undefined,
    });

    if (!validation.isValid) {
      return createValidationErrorResponse(validation.errors, requestId);
    }

    // Validate server configuration and create client using factory
    const subgraphClient = ClientFactory.getSubgraphClient();

    // Calculate skip for pagination
    const skip = paginated ? page * limit : 0;
    const effectiveLimit = maxResults ? Math.min(limit, maxResults) : limit;

    // Build query using the new query builder pattern
    let poolQuery = subgraphClient.query().pools().limit(effectiveLimit);

    // Add skip for pagination
    if (skip > 0) {
      poolQuery = poolQuery.skip(skip);
    }

    // Add field selection if specified
    if (fields && fields.length > 0) {
      poolQuery = poolQuery.select(...fields);
    }

    // Execute query and get serialized results
    const serializedPools = await poolQuery.executeAndSerialize();

    // Add network information to each pool using ClientFactory
    const poolsWithNetwork =
      ClientFactory.addNetworkInfoToPools(serializedPools);

    // Construct response metadata using ClientFactory
    const meta = {
      ...ClientFactory.getNetworkMetadata(),
      requestId,
      processingTime: Date.now() - startTime,
      cached: false,
    };

    // Construct pagination info
    const pagination = {
      page,
      limit,
      total: poolsWithNetwork.length,
      hasMore: poolsWithNetwork.length === limit,
      requestedFields: fields,
    };

    // Create response
    const response = createSuccessResponse(
      poolsWithNetwork,
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
