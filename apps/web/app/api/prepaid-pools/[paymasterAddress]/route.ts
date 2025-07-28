//file:prepaid-gas-website/apps/web/app/api/prepaid-pools/[paymasterAddress]/route.ts
import { NextRequest } from "next/server";
import {
  createSuccessResponse,
  createErrorResponse,
  getRequestId,
  handleApiError,
  setCacheHeaders,
} from "@/lib/api/response";
import { SerializedPaymasterContract, SubgraphClient } from "@prepaid-gas/data";

const CACHE_TTL = parseInt(process.env.POOLS_CACHE_TTL || "300", 10);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymasterAddress: string }> },
) {
  const requestId = await getRequestId();
  const startTime = Date.now();

  try {
    const { paymasterAddress } = await params;

    if (!paymasterAddress || typeof paymasterAddress !== "string") {
      return createErrorResponse(
        "Invalid paymaster address or pool ID",
        "INVALID_PARAMETERS",
        400,
        requestId,
      );
    }

    // Create client using factory
    const subgraphClient = SubgraphClient.createForNetwork(84532, {
      subgraphUrl: process.env.SUBGRAPH_URL,
    });

    // Build query using the query builder pattern with composite key
    let poolWithActivities = await subgraphClient
      .query()
      .paymasters()
      .byAddress(paymasterAddress)
      .withActivities()
      .executeAndSerialize();
    // Execute basic pool query

    if (
      !poolWithActivities ||
      !Array.isArray(poolWithActivities) ||
      poolWithActivities.length === 0 ||
      !poolWithActivities[0]
    ) {
      return createErrorResponse(
        `Pool with paymaster ${paymasterAddress} not found`,
        "POOL_NOT_FOUND",
        404,
        requestId,
      );
    }

    // Add activity to pool data
    const poolData: SerializedPaymasterContract = {
      ...poolWithActivities[0],
    };

    // Construct response metadata using ClientFactory
    const enhancedMeta = {
      requestId,
      processingTime: Date.now() - startTime,
      paymasterAddress,
      timestamp: new Date().toISOString(),
      activityCount: poolData.activities.length,
    };

    // Construct pagination info
    const pagination = {
      page: 0,
      limit: 1,
      total: 1,
      hasMore: false,
    };

    // Create response - pool already has network info + activity
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
