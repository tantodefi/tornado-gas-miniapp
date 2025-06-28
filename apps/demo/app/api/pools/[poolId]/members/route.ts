// file: prepaid-gas-website/apps/demo/app/api/pools/[poolId]/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  SubgraphClient,
  type SubgraphResponse,
  type PoolMember,
} from "@workspace/data";
import { SERVER_CONFIG } from "@/constants/config";

// Response type using data package terminology
interface PoolMembersResponse {
  poolId: string;
  members: string[];
  count: number;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ poolId: string }> },
) {
  try {
    const { poolId } = await context.params;

    // Validate input
    if (!poolId || isNaN(Number(poolId))) {
      return NextResponse.json({ error: "Invalid pool ID" }, { status: 400 });
    }

    // Validate server configuration
    if (!SERVER_CONFIG.subgraph) {
      console.error("❌ SUBGRAPH_URL environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Initialize SubgraphClient from data package
    const subgraphClient = new SubgraphClient({
      subgraphUrl: SERVER_CONFIG.subgraph,
      network: {
        name: "Base",
        chainId: 84532,
        chainName: "Base Sepolia",
        networkName: "Base Sepolia",
        contracts: {
          paymaster: "0xC57352605D9D535001AA0e032C050B2042e38fCf", // From demo config
        },
      },
    });

    // Query pool members using data package method
    const poolMembersResponse: SubgraphResponse<PoolMember[]> =
      await subgraphClient.getPoolMembers(poolId, {
        first: 1000, // Get up to 1000 members
        skip: 0,
      });

    // Extract identity commitments from the response
    const memberCommitments = poolMembersResponse.data.map((member) =>
      member.identityCommitment.toString(),
    );

    // Build response in expected format
    const response: PoolMembersResponse = {
      poolId: poolId,
      members: memberCommitments,
      count: memberCommitments.length,
    };

    // Return with short caching (2 minutes - pool membership can change)
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=240",
      },
    });
  } catch (error) {
    console.error("❌ API: Error fetching pool members:", error);
    return NextResponse.json(
      { error: "Failed to fetch pool members" },
      { status: 500 },
    );
  }
}
