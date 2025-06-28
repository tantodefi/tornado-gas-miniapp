import { Hex } from "viem";
import { PaymasterDataService } from "./PaymasterDataService";
import { POST_OP_GAS_LIMIT } from "../constants";
import { GetPaymasterStubDataV7Parameters } from "../client";
import { parsePaymasterContext } from "../utils";

/**
 * Parameters for gas estimation
 */
export interface GasEstimationParams {
  /** Parameters from the UserOperation */
  parameters: GetPaymasterStubDataV7Parameters;
  /** Paymaster data service for generating stub data */
  paymasterDataService: PaymasterDataService;
}

/**
 * Result of gas estimation
 */
export interface GasEstimationResult {
  /** Whether the estimation is final */
  isFinal: boolean;
  /** Paymaster contract address */
  paymaster: Hex;
  /** Encoded paymaster data */
  paymasterData: Hex;
  /** Post-operation gas limit */
  paymasterPostOpGasLimit: bigint;
  /** Sponsor information */
  sponsor: {
    name: string;
    icon?: string;
  };
}

/**
 * Service for gas estimation operations
 *
 * This service handles:
 * - Creating stub paymaster data for gas estimation
 * - Generating dummy proofs for cost calculation
 * - Providing sponsor information
 * - Calculating gas limits
 */
export class GasEstimationService {
  /**
   * Generate stub paymaster data for gas estimation
   *
   * This method creates dummy paymaster data that can be used to estimate
   * gas costs without requiring a real zero-knowledge proof.
   *
   * @param params - Gas estimation parameters
   * @returns Promise resolving to gas estimation result
   *
   * @example
   * ```typescript
   * const service = new GasEstimationService();
   * const result = await service.getStubData({
   *   parameters: userOpParams,
   *   paymasterDataService: dataService
   * });
   * ```
   */
  async getStubData(params: GasEstimationParams): Promise<GasEstimationResult> {
    const { parameters, paymasterDataService } = params;

    // Validate parameters
    this.validateEstimationParams(params);

    // Check for unsupported features
    if ("initCode" in parameters) {
      throw new Error("Gas estimation with initCode is not supported.");
    }

    // Parse context to get paymaster address and pool ID
    const parsedContext = parsePaymasterContext(
      parameters.context as `0x${string}`,
    );

    // Generate stub paymaster data
    const stubPaymasterData = await paymasterDataService.generateStubData({
      poolId: parsedContext.poolId,
      merkleRootIndex: 0, // Use root index 0 for estimation
    });

    return {
      isFinal: false,
      paymaster: parsedContext.paymasterAddress,
      paymasterData: stubPaymasterData,
      paymasterPostOpGasLimit: POST_OP_GAS_LIMIT,
      sponsor: {
        name: "Prepaid Gas Paymaster",
        icon: "⛽", // Gas pump emoji as default icon
      },
    };
  }

  /**
   * Estimate gas costs for a paymaster operation
   *
   * @param parameters - UserOperation parameters for estimation
   * @param paymasterDataService - Service for generating paymaster data
   * @returns Promise resolving to estimated gas costs
   */
  async estimateGasCosts(
    parameters: GetPaymasterStubDataV7Parameters,
    paymasterDataService: PaymasterDataService,
  ): Promise<{
    verificationGasLimit: bigint;
    postOpGasLimit: bigint;
    preVerificationGas: bigint;
  }> {
    // Generate stub data for gas estimation
    const stubResult = await this.getStubData({
      parameters,
      paymasterDataService,
    });

    // Return estimated gas costs
    // These are estimates based on typical paymaster operations
    return {
      verificationGasLimit: parameters.verificationGasLimit || 100000n,
      postOpGasLimit: stubResult.paymasterPostOpGasLimit,
      preVerificationGas: parameters.preVerificationGas || 50000n,
    };
  }

  /**
   * Get sponsor information for the paymaster
   *
   * @param poolId - Pool ID for sponsor identification
   * @returns Sponsor information
   */
  getSponsorInfo(poolId: bigint): {
    name: string;
    icon?: string;
    poolId: bigint;
  } {
    return {
      name: "Prepaid Gas Paymaster",
      icon: "⛽",
      poolId,
    };
  }

  /**
   * Calculate post-operation gas limit
   *
   * @param baseGasLimit - Base gas limit
   * @param complexity - Operation complexity factor (1.0 = normal)
   * @returns Calculated post-op gas limit
   */
  calculatePostOpGasLimit(
    baseGasLimit: bigint = POST_OP_GAS_LIMIT,
    complexity: number = 1.0,
  ): bigint {
    if (complexity <= 0) {
      throw new Error("Complexity factor must be positive");
    }

    return BigInt(Math.floor(Number(baseGasLimit) * complexity));
  }

  /**
   * Validate gas estimation parameters
   *
   * @private
   * @param params - Parameters to validate
   * @throws Error if validation fails
   */
  private validateEstimationParams(params: GasEstimationParams): void {
    const { parameters, paymasterDataService } = params;

    if (!parameters) {
      throw new Error("Parameters cannot be empty");
    }

    if (!paymasterDataService) {
      throw new Error("PaymasterDataService is required");
    }

    if (!parameters.sender) {
      throw new Error("Sender address is required");
    }

    if (!parameters.callData) {
      throw new Error("Call data is required");
    }

    if (!parameters.context) {
      throw new Error("Context is required for gas estimation");
    }

    if (typeof parameters.chainId !== "number" || parameters.chainId <= 0) {
      throw new Error("Valid chain ID is required");
    }

    if (!parameters.entryPointAddress) {
      throw new Error("Entry point address is required");
    }
  }

  /**
   * Check if parameters are valid for gas estimation
   *
   * @param parameters - Parameters to check
   * @returns True if parameters are valid
   */
  isValidForEstimation(parameters: GetPaymasterStubDataV7Parameters): boolean {
    try {
      this.validateEstimationParams({
        parameters,
        paymasterDataService: new PaymasterDataService(), // Dummy service for validation
      });
      return true;
    } catch {
      return false;
    }
  }
}
