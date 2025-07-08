import { NextRequest } from "next/server";
import {
  createSuccessResponse,
  createErrorResponse,
  getRequestId,
  handleApiError,
  setCacheHeaders,
} from "@/lib/api/response";
import { SubgraphClient } from "@workspace/data";

const CACHE_TTL = parseInt(process.env.POOLS_CACHE_TTL || "300", 10);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = await getRequestId();
  const startTime = Date.now();

  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return createErrorResponse(
        "Invalid pool ID",
        "INVALID_POOL_ID",
        400,
        requestId,
      );
    }

    // Create client using factory
    const subgraphClient = SubgraphClient.createForNetwork(84532, {
      subgraphUrl: process.env.SUBGRAPH_URL,
    });

    // Build query using the query builder pattern
    const poolQuery = subgraphClient
      .query()
      .pools()
      .byPoolId(id)
      .withMembers(20)
      .withUserOperations(20);

    // Execute basic pool query without members
    const serializedPools = await poolQuery.executeAndSerialize();

    if (!serializedPools || serializedPools.length === 0) {
      return createErrorResponse(
        `Pool with ID ${id} not found`,
        "POOL_NOT_FOUND",
        404,
        requestId,
      );
    }

    const poolData = serializedPools[0];

    if (!poolData) {
      return createErrorResponse(
        `Pool with ID ${id} not found`,
        "POOL_NOT_FOUND",
        404,
        requestId,
      );
    }

    // No network transformation needed - data package already includes network info
    // Construct response metadata using ClientFactory
    const enhancedMeta = {
      ...SubgraphClient.getNetworkPreset(84532),
      requestId,
      processingTime: Date.now() - startTime,
      poolId: id,
      timestamp: new Date().toISOString(),
    };

    // Construct pagination info
    const pagination = {
      page: 0,
      limit: 1,
      total: 1,
      hasMore: false,
    };

    // Create response - pool already has network info
    const response = createSuccessResponse(
      poolData,
      enhancedMeta,
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

export const revalidate = 60;
export const runtime = "nodejs";
export const preferredRegion = "auto";
