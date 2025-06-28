//file:prepaid-gas-website/apps/web/app/api/prepaid-pools/[id]/route.ts
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const includeMembers = searchParams.get("includeMembers") === "true";
    const memberLimit = parseInt(searchParams.get("memberLimit") || "100", 10);

    // Validate memberLimit
    if (memberLimit < 1 || memberLimit > 1000) {
      return createErrorResponse(
        "Member limit must be between 1 and 1000",
        "INVALID_MEMBER_LIMIT",
        400,
        requestId,
      );
    }

    // Create pool service
    const poolService = new PoolService();

    // Get pool details with optional members
    const result = await poolService.getPoolDetails(
      id,
      includeMembers,
      memberLimit,
    );

    // Add processing time to meta
    const enhancedMeta = {
      ...result.meta,
      requestId,
      processingTime: Date.now() - startTime,
      poolId: id,
      timestamp: new Date().toISOString(),
      includeMembers, // Include in response for debugging
      memberLimit: includeMembers ? memberLimit : undefined,
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
