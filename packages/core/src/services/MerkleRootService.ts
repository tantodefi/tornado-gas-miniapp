import { PublicClient, Transport, Chain, Hex } from "viem";
import { SubgraphClient } from "@workspace/data";
import { PREPAID_GAS_PAYMASTER_ABI } from "../constants";

/**
 * Parameters for finding the best merkle root index
 */
export interface FindRootIndexParams {
  /** Public client for blockchain interactions */
  publicClient: PublicClient<Transport, Chain>;
  /** Paymaster contract address */
  paymasterAddress: Hex;
  /** Pool ID to find root for */
  poolId: bigint;
  /** Current merkle root to search for */
  currentMerkleRoot: bigint;
  /** Subgraph client for fallback queries */
  subgraphClient: SubgraphClient;
}

/**
 * Result of root index finding operation
 */
export interface FindRootIndexResult {
  /** Index of the merkle root */
  index: number;
  /** Strategy used to find the root */
  strategy:
    | "contract-search"
    | "contract-current"
    | "subgraph-fallback"
    | "ultimate-fallback";
  /** Whether the root was found or using fallback */
  found: boolean;
}

/**
 * Service for managing merkle root operations
 *
 * This service handles:
 * - Finding optimal merkle root indices for proof generation
 * - Contract-based root validation
 * - Subgraph fallback queries
 * - Root history management
 */
export class MerkleRootService {
  /**
   * Find the best valid merkle root index for proof generation
   *
   * Uses multiple strategies in order of preference:
   * 1. Contract search - Find exact root in contract history
   * 2. Contract current - Use current root index from contract
   * 3. Subgraph fallback - Query subgraph for root information
   * 4. Ultimate fallback - Use index 0 (most recent)
   *
   * @param params - Parameters for root finding
   * @returns Promise resolving to root index and metadata
   */
  async findBestRootIndex(
    params: FindRootIndexParams,
  ): Promise<FindRootIndexResult> {
    const {
      publicClient,
      paymasterAddress,
      poolId,
      currentMerkleRoot,
      subgraphClient,
    } = params;

    // Strategy 1: Try to find the current root in the contract's root history
    try {
      const contractSearchResult = await this.findRootInContract(
        publicClient,
        paymasterAddress,
        poolId,
        currentMerkleRoot,
      );

      if (contractSearchResult.found) {
        console.log(
          `Found current root at index: ${contractSearchResult.index}`,
        );
        return {
          index: contractSearchResult.index,
          strategy: "contract-search",
          found: true,
        };
      }
    } catch (error) {
      console.warn("Contract search strategy failed:", error);
    }

    // Strategy 2: Get current root index from pool info
    try {
      const currentIndex = await this.getCurrentRootIndex(
        publicClient,
        paymasterAddress,
        poolId,
      );

      console.log(`Using current index from pool info: ${currentIndex}`);
      return {
        index: currentIndex,
        strategy: "contract-current",
        found: true,
      };
    } catch (error) {
      console.warn("Contract current strategy failed:", error);
    }

    // Strategy 3: Fallback to subgraph
    try {
      const subgraphResult = await this.findRootInSubgraph(
        subgraphClient,
        poolId,
        currentMerkleRoot,
      );

      if (subgraphResult !== null) {
        console.log(`Using subgraph fallback, root index: ${subgraphResult}`);
        return {
          index: subgraphResult,
          strategy: "subgraph-fallback",
          found: true,
        };
      }
    } catch (error) {
      console.warn("Subgraph fallback failed:", error);
    }

    // Strategy 4: Ultimate fallback - use 0 (most recent)
    console.log("Using ultimate fallback: root index 0");
    return {
      index: 0,
      strategy: "ultimate-fallback",
      found: false,
    };
  }

  /**
   * Find a specific merkle root in the contract's root history
   *
   * @private
   * @param publicClient - Blockchain client
   * @param paymasterAddress - Paymaster contract address
   * @param poolId - Pool ID
   * @param merkleRoot - Root to search for
   * @returns Promise resolving to index and found status
   */
  private async findRootInContract(
    publicClient: PublicClient<Transport, Chain>,
    paymasterAddress: Hex,
    poolId: bigint,
    merkleRoot: bigint,
  ): Promise<{ index: number; found: boolean }> {
    const [foundIndex, found] = await publicClient.readContract({
      abi: PREPAID_GAS_PAYMASTER_ABI,
      address: paymasterAddress,
      functionName: "findRootIndex",
      args: [poolId, merkleRoot],
    });

    return {
      index: foundIndex,
      found,
    };
  }

  /**
   * Get the current root index from contract pool info
   *
   * @private
   * @param publicClient - Blockchain client
   * @param paymasterAddress - Paymaster contract address
   * @param poolId - Pool ID
   * @returns Promise resolving to current root index
   */
  private async getCurrentRootIndex(
    publicClient: PublicClient<Transport, Chain>,
    paymasterAddress: Hex,
    poolId: bigint,
  ): Promise<number> {
    const [currentIndex] = await publicClient.readContract({
      abi: PREPAID_GAS_PAYMASTER_ABI,
      address: paymasterAddress,
      functionName: "getPoolRootHistoryInfo",
      args: [poolId],
    });

    return currentIndex;
  }

  /**
   * Find merkle root information in the subgraph
   *
   * @private
   * @param subgraphClient - Subgraph client
   * @param poolId - Pool ID
   * @param merkleRoot - Root to search for
   * @returns Promise resolving to root index or null if not found
   */
  private async findRootInSubgraph(
    subgraphClient: SubgraphClient,
    poolId: bigint,
    merkleRoot: bigint,
  ): Promise<number | null> {
    const result = await subgraphClient.findRootIndex(
      poolId.toString(),
      merkleRoot.toString(),
    );

    return result ? result.index : null;
  }

  /**
   * Get pool root history information from contract
   *
   * @param publicClient - Blockchain client
   * @param paymasterAddress - Paymaster contract address
   * @param poolId - Pool ID
   * @returns Promise resolving to root history info
   */
  async getPoolRootHistoryInfo(
    publicClient: PublicClient<Transport, Chain>,
    paymasterAddress: Hex,
    poolId: bigint,
  ): Promise<{
    currentIndex: number;
    historyCount: number;
    validCount: number;
  }> {
    const [currentIndex, historyCount, validCount] =
      await publicClient.readContract({
        abi: PREPAID_GAS_PAYMASTER_ABI,
        address: paymasterAddress,
        functionName: "getPoolRootHistoryInfo",
        args: [poolId],
      });

    return {
      currentIndex,
      historyCount,
      validCount,
    };
  }
}
