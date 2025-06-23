// app/api/prepaid-cards/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

// Types for detailed pool response
interface DetailedPool {
  id: string;
  amount: number;
  members: number;
  maxMembers: number;
  network: {
    name: string;
    icon: string;
    color: string;
  };
  createdAt: string;
  status: "active" | "full" | "low";
  totalTransactions: number;
  averageGasCost: number;
  description?: string;
  memberList: PoolMember[];
  recentTransactions: Transaction[];
}

interface PoolMember {
  id: string;
  joinedAt: string;
  contributedAmount: number;
  gasUsed: number;
}

interface Transaction {
  id: string;
  type: "join" | "gas_usage" | "refund";
  amount: number;
  timestamp: string;
  txHash?: string;
  member: string;
}

// Mock detailed pool data (in real app, this would come from database)
const MOCK_DETAILED_POOLS: Record<string, DetailedPool> = {
  "PG-4337": {
    id: "PG-4337",
    amount: 0.05,
    members: 847,
    maxMembers: 1000,
    network: { name: "Base Sepolia", icon: "Ξ", color: "#627EEA" },
    createdAt: "2024-12-20T10:30:00Z",
    status: "active",
    totalTransactions: 2341,
    averageGasCost: 0.0023,
    description:
      "High-volume gas pool for frequent transactions on Base Sepolia testnet",
    memberList: [
      {
        id: "member-1",
        joinedAt: "2024-12-20T11:00:00Z",
        contributedAmount: 0.05,
        gasUsed: 0.023,
      },
      {
        id: "member-2",
        joinedAt: "2024-12-20T11:15:00Z",
        contributedAmount: 0.05,
        gasUsed: 0.031,
      },
      {
        id: "member-3",
        joinedAt: "2024-12-20T11:30:00Z",
        contributedAmount: 0.05,
        gasUsed: 0.018,
      },
    ],
    recentTransactions: [
      {
        id: "tx-1",
        type: "gas_usage",
        amount: 0.0034,
        timestamp: "2024-12-21T09:15:00Z",
        txHash:
          "0x742d35c4c6c6a5f23a2c4f1e8d9b6a7c3e5f8a9b2c1d4e6f7a8b9c0d1e2f3a4b",
        member: "member-847",
      },
      {
        id: "tx-2",
        type: "join",
        amount: 0.05,
        timestamp: "2024-12-21T09:10:00Z",
        txHash:
          "0x123d35c4c6c6a5f23a2c4f1e8d9b6a7c3e5f8a9b2c1d4e6f7a8b9c0d1e2f3a4b",
        member: "member-846",
      },
      {
        id: "tx-3",
        type: "gas_usage",
        amount: 0.0021,
        timestamp: "2024-12-21T09:05:00Z",
        txHash:
          "0x456d35c4c6c6a5f23a2c4f1e8d9b6a7c3e5f8a9b2c1d4e6f7a8b9c0d1e2f3a4b",
        member: "member-823",
      },
      {
        id: "tx-4",
        type: "refund",
        amount: 0.0156,
        timestamp: "2024-12-21T08:45:00Z",
        txHash:
          "0x789d35c4c6c6a5f23a2c4f1e8d9b6a7c3e5f8a9b2c1d4e6f7a8b9c0d1e2f3a4b",
        member: "member-801",
      },
      {
        id: "tx-5",
        type: "gas_usage",
        amount: 0.0028,
        timestamp: "2024-12-21T08:30:00Z",
        txHash:
          "0xabcd35c4c6c6a5f23a2c4f1e8d9b6a7c3e5f8a9b2c1d4e6f7a8b9c0d1e2f3a4b",
        member: "member-789",
      },
    ],
  },
  "PG-1234": {
    id: "PG-1234",
    amount: 0.1,
    members: 432,
    maxMembers: 500,
    network: { name: "Ethereum", icon: "Ξ", color: "#627EEA" },
    createdAt: "2024-12-19T15:45:00Z",
    status: "active",
    totalTransactions: 1876,
    averageGasCost: 0.0045,
    description:
      "Premium Ethereum mainnet gas pool with higher contribution amounts",
    memberList: [
      {
        id: "member-eth-1",
        joinedAt: "2024-12-19T16:00:00Z",
        contributedAmount: 0.1,
        gasUsed: 0.067,
      },
      {
        id: "member-eth-2",
        joinedAt: "2024-12-19T16:30:00Z",
        contributedAmount: 0.1,
        gasUsed: 0.089,
      },
    ],
    recentTransactions: [
      {
        id: "tx-eth-1",
        type: "gas_usage",
        amount: 0.0067,
        timestamp: "2024-12-21T09:20:00Z",
        txHash:
          "0xeth742d35c4c6c6a5f23a2c4f1e8d9b6a7c3e5f8a9b2c1d4e6f7a8b9c0d1e2f3",
        member: "member-eth-432",
      },
      {
        id: "tx-eth-2",
        type: "join",
        amount: 0.1,
        timestamp: "2024-12-21T09:00:00Z",
        txHash:
          "0xeth123d35c4c6c6a5f23a2c4f1e8d9b6a7c3e5f8a9b2c1d4e6f7a8b9c0d1e2f3",
        member: "member-eth-431",
      },
    ],
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;

    // Validate pool ID format
    if (!id || !id.startsWith("PG-")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid pool ID format",
            code: "INVALID_POOL_ID",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    // Check if pool exists
    const pool = MOCK_DETAILED_POOLS[id];
    if (!pool) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Pool not found",
            code: "POOL_NOT_FOUND",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 },
      );
    }

    // Simulate realistic API response time (100-300ms)
    const delay = Math.random() * 200 + 100;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Return pool details
    return NextResponse.json(
      {
        success: true,
        data: pool,
        meta: {
          timestamp: new Date().toISOString(),
          poolId: id,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("Pool Details API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to fetch pool details",
          code: "FETCH_ERROR",
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}

// Update pool details (future feature for admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate pool exists
    if (!MOCK_DETAILED_POOLS[id]) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Pool not found",
            code: "POOL_NOT_FOUND",
          },
        },
        { status: 404 },
      );
    }

    // In real app, update pool in database
    const updatedPool = {
      ...MOCK_DETAILED_POOLS[id],
      ...body,
      // Prevent updating critical fields
      id,
      createdAt: MOCK_DETAILED_POOLS[id].createdAt,
    };

    return NextResponse.json({
      success: true,
      data: updatedPool,
      message: "Pool updated successfully",
    });
  } catch (error) {
    console.error("Update Pool Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to update pool",
          code: "UPDATE_ERROR",
        },
      },
      { status: 500 },
    );
  }
}
