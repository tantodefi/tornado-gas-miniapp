//file:prepaid-gas-website/apps/web/app/api/prepaid-pools/route.ts
import { NextRequest } from "next/server";
import { PoolService } from "@/lib/services/pool-service";
import {
  createSuccessResponse,
  createValidationErrorResponse,
  getRequestId,
  handleApiError,
  setCacheHeaders,
} from "@/lib/api/response";

// Environment validation
const CACHE_TTL = parseInt(process.env.POOLS_CACHE_TTL || "300", 10); // 5 minutes default

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
      ? fieldsParam.split(",").map((f) => f.trim())
      : undefined;

    // Create pool service
    const poolService = new PoolService();

    // Validate parameters
    const validation = poolService.validateQueryOptions({
      page: page.toString(),
      limit: limit.toString(),
      maxResults: maxResults?.toString(),
      fields: fieldsParam,
    });

    if (!validation.isValid) {
      return createValidationErrorResponse(validation.errors, requestId);
    }

    // Get pools data
    const result = await poolService.getAllPools({
      page,
      limit,
      maxResults,
      paginated,
      fields,
    });

    // Add processing time to meta
    const enhancedMeta = {
      ...result.meta,
      requestId,
      processingTime: Date.now() - startTime,
      cached: false,
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

// Enable static generation with revalidation
export const revalidate = 300; // 5 minutes

// Runtime configuration
export const runtime = "nodejs";
export const preferredRegion = "auto";
