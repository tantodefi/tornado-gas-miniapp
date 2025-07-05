import { NextRequest } from "next/server";
import { ClientFactory } from "@/lib/services/client-factory";
import { CACHE_CONFIG } from "@/constants/network";
import {
  createSuccessResponse,
  createErrorResponse,
  getRequestId,
  handleApiError,
  setCacheHeaders,
} from "@/lib/api/response";

const CACHE_TTL = CACHE_CONFIG.POOL_DETAILS_TTL;

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

    // Create client using factory
    const subgraphClient = ClientFactory.getSubgraphClient();

    // Build query using the query builder pattern
    const poolQuery = subgraphClient.query().pools().byPoolId(id);

    // If members are requested, include them in the query
    if (includeMembers) {
      const poolWithMembersQuery = poolQuery.withMembers().limit(memberLimit);
      console.log({ poolWithMembersQuery });
      // Execute query and get serialized results
      const serializedPools = await poolWithMembersQuery.executeAndSerialize();

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
        ...ClientFactory.getNetworkMetadata(),
        requestId,
        processingTime: Date.now() - startTime,
        poolId: id,
        timestamp: new Date().toISOString(),
        includeMembers,
        memberLimit,
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
    } else {
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
        ...ClientFactory.getNetworkMetadata(),
        requestId,
        processingTime: Date.now() - startTime,
        poolId: id,
        timestamp: new Date().toISOString(),
        includeMembers,
        memberLimit: includeMembers ? memberLimit : undefined,
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
    }
  } catch (error) {
    return handleApiError(error, requestId);
  }
}

export const revalidate = 60;
export const runtime = "nodejs";
export const preferredRegion = "auto";
