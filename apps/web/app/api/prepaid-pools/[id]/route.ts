//file:prepaid-gas-website/apps/web/app/api/prepaid-pools/[id]/route.ts
import { NextRequest } from "next/server";
import {
  createSuccessResponse,
  createErrorResponse,
  getRequestId,
  handleApiError,
  setCacheHeaders,
} from "@/lib/api/response";
import {
  SerializedPoolMember,
  SerializedUserOperation,
  SubgraphClient,
} from "@workspace/data";
import type {
  ActivityItem,
  MemberAddedActivity,
  TransactionActivity,
} from "@/types/pool";

const CACHE_TTL = parseInt(process.env.POOLS_CACHE_TTL || "300", 10);

/**
 * Transform pool members into activity items
 */
function transformMembersToActivity(
  members: SerializedPoolMember[],
): MemberAddedActivity[] {
  return members.map((member) => ({
    id: `member-${member.id}`,
    type: "member_added" as const,
    timestamp: member.addedAtTimestamp,
    blockNumber: member.addedAtBlock,
    transactionHash: member.addedAtTransaction,
    network: member.network,
    member: {
      memberIndex: member.memberIndex,
      identityCommitment: member.identityCommitment,
      merkleRootWhenAdded: member.merkleRootWhenAdded,
      rootIndexWhenAdded: member.rootIndexWhenAdded,
    },
  }));
}

/**
 * Transform user operations into activity items
 */
function transformTransactionsToActivity(
  userOperations: SerializedUserOperation[],
): TransactionActivity[] {
  return userOperations.map((op) => ({
    id: `transaction-${op.id}`,
    type: "transaction" as const,
    timestamp: op.executedAtTimestamp,
    blockNumber: op.executedAtBlock,
    transactionHash: op.executedAtTransaction,
    network: op.network,
    transaction: {
      userOpHash: op.userOpHash,
      sender: op.sender,
      actualGasCost: op.actualGasCost,
      nullifier: op.nullifier,
      gasPrice: op.gasPrice,
    },
  }));
}

/**
 * Combine and sort activities by timestamp (newest first)
 */
function createUnifiedActivity(
  members: SerializedPoolMember[],
  userOperations: SerializedUserOperation[],
  limit: number = 50,
): ActivityItem[] {
  const memberActivities = transformMembersToActivity(members);
  const transactionActivities = transformTransactionsToActivity(userOperations);

  // Combine all activities
  const allActivities: ActivityItem[] = [
    ...memberActivities,
    ...transactionActivities,
  ];

  // Sort by timestamp (newest first)
  allActivities.sort((a, b) => {
    const timestampA = parseInt(a.timestamp);
    const timestampB = parseInt(b.timestamp);
    return timestampB - timestampA;
  });

  // Limit the results
  return allActivities.slice(0, limit);
}

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

    // Parse query parameters for activity options
    const { searchParams } = new URL(request.url);
    const activityLimit = parseInt(
      searchParams.get("activityLimit") || "50",
      10,
    );
    const memberLimit = parseInt(searchParams.get("memberLimit") || "100", 10);

    // Create client using factory
    const subgraphClient = SubgraphClient.createForNetwork(84532, {
      subgraphUrl: process.env.SUBGRAPH_URL,
    });

    // Build query using the query builder pattern
    let poolQuery = subgraphClient.query().pools().byPoolId(id);

    // Include members and userOperations for activity
    poolQuery = poolQuery.withMembers(memberLimit);
    poolQuery = poolQuery.withUserOperations(activityLimit);

    // Execute basic pool query
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

    const members = poolData.members || [];
    const userOperations = poolData.userOperations || [];

    // Create unified activity array
    const activity = createUnifiedActivity(
      members,
      userOperations,
      activityLimit,
    );

    // Add activity to pool data
    const enhancedPoolData = {
      ...poolData,
      activity, // Add the unified activity feed
    };

    // Construct response metadata using ClientFactory
    const enhancedMeta = {
      ...SubgraphClient.getNetworkPreset(84532),
      requestId,
      processingTime: Date.now() - startTime,
      poolId: id,
      timestamp: new Date().toISOString(),
      activityCount: activity.length,
      memberCount: members.length,
      transactionCount: userOperations.length,
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
      enhancedPoolData,
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
