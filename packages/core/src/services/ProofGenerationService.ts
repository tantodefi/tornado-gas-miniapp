import { generateProof } from "@semaphore-protocol/proof";
import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import type { SemaphoreProof } from "@semaphore-protocol/proof";
import { fromHex } from "viem";

/**
 * Input parameters for proof generation
 */
export interface ProofGenerationParams {
  /** Identity string (private key or commitment) */
  identityHex: `0x${string}`;
  /** Array of pool member identity commitments */
  poolMembers: bigint[];
  /** Message to sign (usually operation hash) */
  messageHash: bigint;
  /** Pool ID for proof scope */
  poolId: bigint;
}

/**
 * Result of proof generation
 */
export interface ProofGenerationResult {
  /** Generated Semaphore proof */
  proof: SemaphoreProof;
  /** Group that was used for proof generation */
  group: Group;
  /** Identity that was used for proof generation */
  identity: Identity;
}

/**
 * Service for generating zero-knowledge proofs using Semaphore protocol
 *
 * This service handles:
 * - Creating Semaphore groups from pool members
 * - Managing user identities
 * - Generating ZK proofs for pool membership
 */
export class ProofGenerationService {
  /**
   * Generate a zero-knowledge proof of pool membership
   *
   * @param params - Proof generation parameters
   * @returns Promise resolving to proof and related objects
   *
   * @example
   * ```typescript
   * const service = new ProofGenerationService();
   * const result = await service.generateProof({
   *   identityString: "0x123...",
   *   poolMembers: [BigInt("0x456..."), BigInt("0x789...")],
   *   messageHash: BigInt("0xabc..."),
   *   poolId: 1n
   * });
   * ```
   */
  async generateProof(
    params: ProofGenerationParams,
  ): Promise<ProofGenerationResult> {
    const { identityHex, poolMembers, messageHash, poolId } = params;
    // Validate inputs
    this.validateProofParams(params);

    // Convert bytes identity back to string
    let identityBase64: string;
    try {
      // Try direct fromHex conversion first
      try {
        identityBase64 = fromHex(identityHex, "string");
        console.log("🔍 Converted identity from hex bytes to string:", {
          hex: identityHex,
          string: identityBase64,
        });
      } catch (hexError) {
        // If that fails, the identityString might already be a string, not hex bytes
        console.log("🔍 Identity may already be a string, not hex bytes");
        if (typeof identityHex === "string") {
          identityBase64 = identityHex;
          console.log("🔍 Using identity string directly:", identityBase64);
        } else {
          throw hexError;
        }
      }
    } catch (conversionError) {
      console.error("Identity conversion error:", conversionError);
      throw new Error(
        `Failed to decode identity from context: ${conversionError instanceof Error ? conversionError.message : "Unknown error"}`,
      );
    }
    // Create Semaphore group from pool members
    const group = new Group(poolMembers);
    // Create user identity
    const identity = Identity.import(identityBase64);

    // Verify identity is in the group
    const memberIndex = group.indexOf(identity.commitment);
    if (memberIndex === -1) {
      throw new Error(
        `Identity commitment ${identity.commitment} is not a member of pool ${poolId}`,
      );
    }

    // Generate the proof
    const proof = await generateProof(identity, group, messageHash, poolId);

    return {
      proof,
      group,
      identity,
    };
  }

  /**
   * Validate proof generation parameters
   *
   * @private
   * @param params - Parameters to validate
   * @throws Error if validation fails
   */
  private validateProofParams(params: ProofGenerationParams): void {
    const { identityHex, poolMembers, messageHash, poolId } = params;

    if (!identityHex || identityHex.length === 0) {
      throw new Error("Identity string cannot be empty");
    }

    if (!poolMembers || poolMembers.length === 0) {
      throw new Error("Pool members array cannot be empty");
    }

    if (messageHash <= 0n) {
      throw new Error("Message hash must be a positive BigInt");
    }

    if (poolId < 0n) {
      throw new Error("Pool ID must be a non-negative BigInt");
    }

    // Validate pool members are valid commitments
    for (const member of poolMembers) {
      if (member <= 0n) {
        throw new Error(
          "All pool member commitments must be positive BigInt values",
        );
      }
    }
  }

  /**
   * Create a Semaphore group from pool member commitments
   *
   * @param poolMembers - Array of identity commitments
   * @returns Semaphore group containing all members
   */
  createGroup(poolMembers: bigint[]): Group {
    if (!poolMembers || poolMembers.length === 0) {
      throw new Error("Cannot create group with empty member list");
    }

    return new Group(poolMembers);
  }

  /**
   * Create a Semaphore identity from string
   *
   * @param identityString - Identity string or private key
   * @returns Semaphore identity
   */
  createIdentity(identityString: string): Identity {
    if (!identityString || identityString.length === 0) {
      throw new Error("Identity string cannot be empty");
    }

    return new Identity(identityString);
  }

  /**
   * Verify that an identity is a member of a group
   *
   * @param identity - Identity to check
   * @param group - Group to check membership in
   * @returns True if identity is a member
   */
  verifyMembership(identity: Identity, group: Group): boolean {
    return group.indexOf(identity.commitment) !== -1;
  }
}
