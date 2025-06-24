// apps/web/types/pool.ts

/**
 * Complete Pool interface matching API response
 * Single source of truth for Pool type across the app
 */
export interface Pool {
  id: string;
  poolId: string;
  joiningFee: string;
  merkleTreeDuration: string;
  totalDeposits: string;
  currentMerkleTreeRoot: string;
  membersCount: string;
  merkleTreeDepth: string;
  createdAt: string;
  createdAtBlock: string;
  currentRootIndex: number;
  rootHistoryCount: number;
  network: {
    name: string;
    chainId: number;
    chainName: string;
    networkName: string;
    contracts: {
      paymaster: string;
      verifier?: string;
    };
  };
}

/**
 * Filter state for pool filtering
 */
export interface FilterState {
  network: string;
  amountRange: string;
  memberRange: string;
  sortBy: string;
}
