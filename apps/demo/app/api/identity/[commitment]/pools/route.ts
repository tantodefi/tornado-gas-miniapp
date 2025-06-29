//file: prepaid-gas-website/apps/demo/app/api/identity/[commitment]/pools/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  SubgraphClient,
  serializePool,
  serializePoolMember,
  type SubgraphResponse,
} from "@workspace/data";
import { SERVER_CONFIG } from "@/constants/config";

// Updated response type using data package terminology
interface SerializedPoolMembershipInfo {
  membershipId: string;
  identityCommitment: string;
  memberIndex: string;
  joinedAt: string;
  joinedAtBlock: string;
  pool: {
    poolId: string; // Serialized from BigInt
    joiningFee: string;
    memberCount: string; // Serialized from BigInt
    totalDeposits: string;
    createdAt: string; // Serialized from BigInt
  };
}

// Helper function to transform data package response to expected format
function transformPoolMemberships(
  response: SubgraphResponse<Array<{ member: any; pool: any }>>,
): SerializedPoolMembershipInfo[] {
  return response.data.map(({ member, pool }) => {
    // Use data package serialization utilities
    const serializedPool = serializePool(pool);
    const serializedMember = serializePoolMember(member);

    return {
      membershipId: serializedMember.id,
      identityCommitment: serializedMember.identityCommitment,
      memberIndex: serializedMember.memberIndex,
      joinedAt: serializedMember.joinedAt,
      joinedAtBlock: serializedMember.joinedAtBlock,
      pool: {
        poolId: serializedPool.poolId, // Already serialized by data package
        joiningFee: serializedPool.joiningFee,
        memberCount: serializedPool.membersCount, // Note: membersCount in data package
        totalDeposits: serializedPool.totalDeposits,
        createdAt: serializedPool.createdAt,
      },
    };
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ commitment: string }> },
) {
  try {
    const { commitment } = await context.params;

    // Validate input
    if (!commitment || commitment.length < 10) {
      return NextResponse.json(
        { error: "Invalid identity commitment" },
        { status: 400 },
      );
    }

    // Validate server configuration
    if (!SERVER_CONFIG.subgraph) {
      console.error("❌ SUBGRAPH_URL environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // ✨ NEW: Use factory method with Base Sepolia preset (chainId: 84532)
    // Much cleaner than manual configuration!
    const subgraphClient = SubgraphClient.createForNetwork(84532, {
      subgraphUrl: SERVER_CONFIG.subgraph, // Override with env variable
    });

    // Query pools using data package method (updated terminology)
    const poolsResponse = await subgraphClient.getPoolsByIdentity(commitment);

    // Transform response using data package serialization
    const serializedPools = transformPoolMemberships(poolsResponse);

    // Return with caching headers (5 minutes cache)
    return NextResponse.json(serializedPools, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("❌ API: Error fetching pools:", error);
    return NextResponse.json(
      { error: "Failed to fetch pools" },
      { status: 500 },
    );
  }
}
