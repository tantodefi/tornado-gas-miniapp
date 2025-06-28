import {
  Hex,
  encodeAbiParameters,
  parseAbiParameters,
  stringToHex,
} from "viem";
import type { SemaphoreProof } from "@semaphore-protocol/proof";
import { generatePaymasterData, PrepaidGasPaymasterMode } from "../utils";

/**
 * Parsed context data from paymaster parameters
 */
export interface ParsedContext {
  /** Paymaster contract address */
  paymasterAddress: Hex;
  /** Pool ID for the operation */
  poolId: bigint;
  /** Optional identity string for proof generation */
  identityString: string;
}

/**
 * Parameters for generating paymaster data
 */
export interface PaymasterDataParams {
  /** Operation mode (validation or estimation) */
  mode: PrepaidGasPaymasterMode;
  /** Pool ID */
  poolId: bigint;
  /** Zero-knowledge proof */
  proof: SemaphoreProof;
  /** Merkle root index in pool history */
  merkleRootIndex: number;
}

/**
 * Parameters for generating stub data
 */
export interface StubDataParams {
  /** Pool ID for the stub */
  poolId: bigint;
  /** Merkle root index (optional, defaults to 0) */
  merkleRootIndex?: number;
}

/**
 * Service for managing paymaster data operations
 *
 * This service handles:
 * - Encoding and decoding paymaster data
 * - Generating stub data for gas estimation
 * - Creating real paymaster data with proofs
 * - Context parsing and validation
 */
export class PaymasterDataService {
  /**
   * Generate real paymaster data with zero-knowledge proof
   *
   * @param params - Parameters for paymaster data generation
   * @returns Promise resolving to encoded paymaster data
   *
   * @example
   * ```typescript
   * const service = new PaymasterDataService();
   * const data = await service.generatePaymasterData({
   *   mode: PrepaidGasPaymasterMode.VALIDATION_MODE,
   *   poolId: 1n,
   *   proof: semaphoreProof,
   *   merkleRootIndex: 5
   * });
   * ```
   */
  async generatePaymasterData(params: PaymasterDataParams): Promise<Hex> {
    const { mode, poolId, proof, merkleRootIndex } = params;

    // Validate parameters
    this.validatePaymasterDataParams(params);

    return generatePaymasterData(mode, poolId, proof, merkleRootIndex);
  }

  /**
   * Generate stub paymaster data for gas estimation
   *
   * Creates dummy proof data that can be used to estimate gas costs
   * without requiring a real zero-knowledge proof.
   *
   * @param params - Parameters for stub data generation
   * @returns Promise resolving to encoded stub paymaster data
   *
   * @example
   * ```typescript
   * const service = new PaymasterDataService();
   * const stubData = await service.generateStubData({
   *   poolId: 1n,
   *   merkleRootIndex: 0
   * });
   * ```
   */
  async generateStubData(params: StubDataParams): Promise<Hex> {
    const { poolId, merkleRootIndex = 0 } = params;

    // Create dummy proof for gas estimation
    const dummyProof = {
      merkleTreeDepth: 1, // MIN_DEPTH
      merkleTreeRoot:
        "0x1234567890123456789012345678901234567890123456789012345678901234", // Dummy root
      nullifier: "0",
      message: "0",
      scope: poolId.toString(),
      points: [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n] as [
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
      ],
    };

    return generatePaymasterData(
      PrepaidGasPaymasterMode.GAS_ESTIMATION_MODE,
      poolId,
      dummyProof,
      merkleRootIndex,
    );
  }

  /**
   * Create context data for UserOperation
   *
   * @param paymasterAddress - Paymaster contract address
   * @param poolId - Pool ID
   * @param identityString - Optional identity for proof generation
   * @returns Encoded context data
   *
   * @example
   * ```typescript
   * const service = new PaymasterDataService();
   * const context = service.createContext(
   *   "0x123...",
   *   1n,
   *   "identity-string"
   * );
   * ```
   */
  createContext(
    paymasterAddress: Hex,
    poolId: bigint,
    identityString?: string,
  ): Hex {
    if (identityString) {
      return encodeAbiParameters(
        parseAbiParameters(
          "address paymasterAddress, uint256 poolId, bytes identity",
        ),
        [paymasterAddress, poolId, stringToHex(identityString)],
      );
    } else {
      return encodeAbiParameters(
        parseAbiParameters("address paymasterAddress, uint256 poolId"),
        [paymasterAddress, poolId],
      );
    }
  }

  /**
   * Validate paymaster data generation parameters
   *
   * @private
   * @param params - Parameters to validate
   * @throws Error if validation fails
   */
  private validatePaymasterDataParams(params: PaymasterDataParams): void {
    const { mode, poolId, proof, merkleRootIndex } = params;

    if (
      mode !== PrepaidGasPaymasterMode.VALIDATION_MODE &&
      mode !== PrepaidGasPaymasterMode.GAS_ESTIMATION_MODE
    ) {
      throw new Error("Invalid paymaster mode");
    }

    if (poolId < 0n) {
      throw new Error("Pool ID must be non-negative");
    }

    if (merkleRootIndex < 0 || merkleRootIndex >= 64) {
      throw new Error("Merkle root index must be between 0 and 63");
    }

    if (!proof) {
      throw new Error("Proof cannot be empty");
    }

    // Validate proof structure
    if (!proof.merkleTreeRoot || !proof.nullifier || !proof.points) {
      throw new Error("Invalid proof structure: missing required fields");
    }

    if (proof.points.length !== 8) {
      throw new Error(
        "Invalid proof structure: points array must have 8 elements",
      );
    }
  }
}
