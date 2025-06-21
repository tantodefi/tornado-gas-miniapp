// app/api/prepaid-cards/route.ts
import { NextRequest, NextResponse } from "next/server";

// Types
interface Pool {
  id: string;
  amount: number;
  members: number;
  network: {
    name: string;
    icon: string;
    color: string;
  };
  createdAt: string;
  status: "active" | "full" | "low";
}

// Mock database - in real app, this would be your database queries
const MOCK_POOLS: Pool[] = [
  {
    id: "PG-4337",
    amount: 0.05,
    members: 847,
    network: { name: "Base Sepolia", icon: "Ξ", color: "#627EEA" },
    createdAt: "2024-12-20T10:30:00Z",
    status: "active",
  },
  {
    id: "PG-1234",
    amount: 0.1,
    members: 432,
    network: { name: "Ethereum", icon: "Ξ", color: "#627EEA" },
    createdAt: "2024-12-19T15:45:00Z",
    status: "active",
  },
  {
    id: "PG-5678",
    amount: 0.02,
    members: 1200,
    network: { name: "Polygon", icon: "◈", color: "#8247E5" },
    createdAt: "2024-12-18T08:20:00Z",
    status: "full",
  },
  {
    id: "PG-9012",
    amount: 0.03,
    members: 156,
    network: { name: "Arbitrum", icon: "▲", color: "#28A0F0" },
    createdAt: "2024-12-17T12:10:00Z",
    status: "low",
  },
  {
    id: "PG-3456",
    amount: 0.15,
    members: 89,
    network: { name: "Base Sepolia", icon: "Ξ", color: "#627EEA" },
    createdAt: "2024-12-16T16:30:00Z",
    status: "active",
  },
  {
    id: "PG-7890",
    amount: 0.008,
    members: 45,
    network: { name: "Ethereum", icon: "Ξ", color: "#627EEA" },
    createdAt: "2024-12-15T09:15:00Z",
    status: "active",
  },
  {
    id: "PG-2468",
    amount: 0.25,
    members: 234,
    network: { name: "Polygon", icon: "◈", color: "#8247E5" },
    createdAt: "2024-12-14T14:20:00Z",
    status: "active",
  },
  {
    id: "PG-1357",
    amount: 0.12,
    members: 567,
    network: { name: "Arbitrum", icon: "▲", color: "#28A0F0" },
    createdAt: "2024-12-13T11:45:00Z",
    status: "active",
  },
];

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for filtering/sorting
    const { searchParams } = new URL(request.url);
    const network = searchParams.get("network");
    const amountRange = searchParams.get("amountRange");
    const memberRange = searchParams.get("memberRange");
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Start with all pools
    let filteredPools = [...MOCK_POOLS];

    // Apply network filter
    if (network) {
      filteredPools = filteredPools.filter((pool) =>
        pool.network.name.toLowerCase().includes(network.toLowerCase()),
      );
    }

    // Apply amount range filter
    if (amountRange) {
      filteredPools = filteredPools.filter((pool) => {
        switch (amountRange) {
          case "0-0.01":
            return pool.amount <= 0.01;
          case "0.01-0.05":
            return pool.amount > 0.01 && pool.amount <= 0.05;
          case "0.05-0.1":
            return pool.amount > 0.05 && pool.amount <= 0.1;
          case "0.1+":
            return pool.amount > 0.1;
          default:
            return true;
        }
      });
    }

    // Apply member range filter
    if (memberRange) {
      filteredPools = filteredPools.filter((pool) => {
        switch (memberRange) {
          case "small":
            return pool.members <= 500;
          case "medium":
            return pool.members > 500 && pool.members <= 1000;
          case "large":
            return pool.members > 1000;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filteredPools.sort((a, b) => {
      switch (sortBy) {
        case "amount-high":
          return b.amount - a.amount;
        case "amount-low":
          return a.amount - b.amount;
        case "members-high":
          return b.members - a.members;
        case "members-low":
          return a.members - b.members;
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPools = filteredPools.slice(startIndex, endIndex);

    // Simulate realistic API response time (50-200ms)
    const delay = Math.random() * 150 + 50;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: paginatedPools,
        pagination: {
          page,
          limit,
          total: filteredPools.length,
          totalPages: Math.ceil(filteredPools.length / limit),
          hasNext: endIndex < filteredPools.length,
          hasPrev: page > 1,
        },
        meta: {
          filters: {
            network,
            amountRange,
            memberRange,
            sortBy,
          },
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to fetch prepaid cards",
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

// POST endpoint for creating new pools (future feature)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { amount, networkId } = body;
    if (!amount || !networkId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Missing required fields: amount and networkId",
            code: "VALIDATION_ERROR",
          },
        },
        { status: 400 },
      );
    }

    // In real app, create pool in database
    const newPool: Pool = {
      id: `PG-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      amount: parseFloat(amount),
      members: 1, // Creator is first member
      network: {
        name: networkId === "eth" ? "Ethereum" : "Base Sepolia",
        icon: "Ξ",
        color: "#627EEA",
      },
      createdAt: new Date().toISOString(),
      status: "active",
    };

    return NextResponse.json(
      {
        success: true,
        data: newPool,
        message: "Pool created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create Pool Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to create pool",
          code: "CREATE_ERROR",
        },
      },
      { status: 500 },
    );
  }
}
