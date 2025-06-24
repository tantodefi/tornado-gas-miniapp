import { NextRequest } from "next/server";
import { PoolService } from "@/lib/services/pool-service";
import {
  createSuccessResponse,
  createErrorResponse,
  getRequestId,
  handleApiError,
  setCacheHeaders,
} from "@/lib/api/response";

const CACHE_TTL = parseInt(process.env.POOL_DETAILS_CACHE_TTL || "60", 10);

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

    // Create pool service
    const poolService = new PoolService();

    // Get pool details
    const result = await poolService.getPoolDetails(id);

    // Add processing time to meta
    const enhancedMeta = {
      ...result.meta,
      requestId,
      processingTime: Date.now() - startTime,
      poolId: id,
      timestamp: new Date().toISOString(),
    };

    // Create response
    const response = createSuccessResponse(
      result.data,
      enhancedMeta,
      result.pagination,
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
