// file :prepaid-gas-website/apps/demo/types/api.ts

// API-specific response types using pool terminology
export interface SerializedPoolMembershipInfo {
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

// Pool members API response type
export interface PoolMembersResponse {
  poolId: string;
  members: string[];
  count: number;
}

// Re-export data package types for convenience
export type {
  SerializedPool,
  SerializedPoolMember,
  Pool,
  PoolMember,
  MerkleRootHistory,
  NetworkMetadata,
  SubgraphResponse,
} from "@workspace/data";
