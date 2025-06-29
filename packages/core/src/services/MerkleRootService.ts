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
   * Find merkle root index for proof generation
   *
   * 1. Contract current - Use current root index from contract
   *
   * @param params - Parameters for root finding
   * @returns Promise resolving to root index and metadata
   */
  async findBestRootIndex(
    params: FindRootIndexParams,
  ): Promise<FindRootIndexResult | undefined> {
    const { publicClient, paymasterAddress, poolId } = params;

    // Strategy 1: Try to find the current root in the contract's root history
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
