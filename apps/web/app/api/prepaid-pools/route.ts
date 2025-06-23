// app/api/prepaid-pools/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  PrepaidGasPaymasterSubgraphClient,
  type PoolFields,
} from "@workspace/core";
import { headers } from "next/headers";

// Environment validation
const SUBGRAPH_URL = process.env.SUBGRAPH_URL;
const CACHE_TTL = parseInt(process.env.POOLS_CACHE_TTL || "300", 10); // 5 minutes default
console.log({ SUBGRAPH_URL });
if (!SUBGRAPH_URL) {
  console.error("SUBGRAPH_URL environment variable is required");
}

// Initialize client with singleton pattern
let subgraphClient: PrepaidGasPaymasterSubgraphClient | null = null;

function getSubgraphClient() {
  if (!subgraphClient && SUBGRAPH_URL) {
    subgraphClient = new PrepaidGasPaymasterSubgraphClient({
      network: "base-sepolia",
      subgraphUrl: SUBGRAPH_URL,
    });
  }
  return subgraphClient;
}

// Validation schemas
const MAX_LIMIT = 1000;
const MAX_MAX_RESULTS = 10000;

// ✅ Updated VALID_FIELDS with correct field names
const VALID_FIELDS: PoolFields[] = [
  "id",
  "poolId",
  "joiningFee",
  "merkleTreeDuration",
  "totalDeposits",
  "currentMerkleTreeRoot",
  "membersCount", // ✅ Updated field name
  "merkleTreeDepth",
  "createdAt",
  "createdAtBlock",
  "currentRootIndex",
  "rootHistoryCount",
];

interface ValidationError {
  field: string;
  message: string;
}

function validateQueryParams(searchParams: URLSearchParams) {
  const errors: ValidationError[] = [];

  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const maxResults = searchParams.get("maxResults");
  const fields = searchParams.get("fields");

  // Validate page
  if (page !== null) {
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 0) {
      errors.push({
        field: "page",
        message: "Page must be a non-negative integer",
      });
    }
  }

  // Validate limit
  if (limit !== null) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum <= 0 || limitNum > MAX_LIMIT) {
      errors.push({
        field: "limit",
        message: `Limit must be between 1 and ${MAX_LIMIT}`,
      });
    }
  }

  // Validate maxResults
  if (maxResults !== null) {
    const maxRes = parseInt(maxResults, 10);
    if (isNaN(maxRes) || maxRes <= 0 || maxRes > MAX_MAX_RESULTS) {
      errors.push({
        field: "maxResults",
        message: `MaxResults must be between 1 and ${MAX_MAX_RESULTS}`,
      });
    }
  }

  // Validate fields
  if (fields !== null) {
    const fieldList = fields.split(",").map((f) => f.trim());
    const invalidFields = fieldList.filter(
      (f) => !VALID_FIELDS.includes(f as PoolFields),
    );
    if (invalidFields.length > 0) {
      errors.push({
        field: "fields",
        message: `Invalid fields: ${invalidFields.join(", ")}. Valid fields: ${VALID_FIELDS.join(", ")}`,
      });
    }
  }

  return errors;
}

export async function GET(request: NextRequest) {
  const requestId =
    (await headers()).get("x-request-id") || crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Environment check
    if (!SUBGRAPH_URL) {
      return NextResponse.json(
        {
          success: false,
          error: "Service configuration error",
          requestId,
        },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validationErrors = validateQueryParams(searchParams);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validationErrors,
          requestId,
        },
        { status: 400 },
      );
    }

    // Parse validated parameters
    const page = parseInt(searchParams.get("page") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const maxResults = searchParams.get("maxResults")
      ? parseInt(searchParams.get("maxResults")!, 10)
      : undefined;
    const paginated = searchParams.get("paginated") !== "false";
    const fieldsParam = searchParams.get("fields");

    const skip = page * limit;
    const selectedFields: PoolFields[] | undefined = fieldsParam
      ? (fieldsParam.split(",").map((f) => f.trim()) as PoolFields[])
      : undefined;

    const client = getSubgraphClient();
    if (!client) {
      throw new Error("Failed to initialize subgraph client");
    }

    let totalCount = 0;
    let hasMore = false;

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 30000); // 30s timeout
    });

    const dataPromise = async () => {
      if (paginated) {
        const result = await client.getAllPoolsPaginated({
          pageSize: limit,
          fields: selectedFields,
          maxResults,
        });
        totalCount = result.data.length;
        hasMore = maxResults ? result.data.length >= maxResults : false;
        return result;
      } else {
        const result = await client.getAllPools({
          first: limit,
          skip,
          fields: selectedFields,
        });
        totalCount = result.data.length;
        hasMore = result.data.length === limit;
        return result;
      }
    };

    const pools = await Promise.race([dataPromise(), timeoutPromise]);

    const response = NextResponse.json(
      {
        success: true,
        data: pools.data,
        meta: {
          ...pools.meta,
          requestId,
          processingTime: Date.now() - startTime,
          cached: false,
        },
        pagination: {
          page,
          limit,
          total: totalCount,
          hasMore,
          requestedFields: selectedFields,
        },
      },
      { status: 200 },
    );

    // Set caching headers
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`,
    );
    response.headers.set("X-Request-ID", requestId);
    response.headers.set("X-Processing-Time", `${Date.now() - startTime}ms`);

    // CORS headers if needed
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return response;
  } catch (error) {
    const isTimeout =
      error instanceof Error && error.message === "Request timeout";
    const statusCode = isTimeout ? 504 : 500;

    console.error(`[${requestId}] Error fetching prepaid pools:`, {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: isTimeout ? "Request timeout" : "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        requestId,
        meta: {
          processingTime: Date.now() - startTime,
        },
      },
      { status: statusCode },
    );
  }
}

// Enable static generation with revalidation
export const revalidate = 300; // 5 minutes

// Runtime configuration
export const runtime = "nodejs";
export const preferredRegion = "auto";
