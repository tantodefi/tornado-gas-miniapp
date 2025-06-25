import {
  GetPaymasterDataParameters,
  GetPaymasterStubDataReturnType,
  UserOperation,
} from "viem/account-abstraction";
import {
  createPublicClient,
  Hex,
  http,
  PublicClient,
  Transport,
  Chain,
} from "viem";
import { getPackedUserOperation } from "permissionless";

// Use new data package
import { SubgraphClient } from "@workspace/data";

// Import our new services
import { ProofGenerationService } from "../services/ProofGenerationService.js";
import { MerkleRootService } from "../services/MerkleRootService.js";
import { PaymasterDataService } from "../services/PaymasterDataService.js";
import { GasEstimationService } from "../services/GasEstimationService.js";

import { getChainById, PrepaidGasPaymasterMode } from "../utils";
import { PREPAID_GAS_PAYMASTER_ABI } from "../constants";
import { getChainConfig, validateChainConfig } from "../constants/chains";
import {
  PrepaidGasPaymasterConfig,
  GetPaymasterStubDataV7Parameters,
} from "./types";

/**
 * Main client for interacting with the Prepaid Gas Paymaster system
 *
 * This class provides methods for:
 * - Generating paymaster stub data for gas estimation
 * - Creating paymaster data with zero-knowledge proofs
 * - Managing pool memberships and proof generation
 *
 * @example
 * ```typescript
 * // Using network configuration
 * const paymaster = new PrepaidGasPaymaster({
 *   network: 'base-sepolia'
 * });
 *
 * // Get stub data for gas estimation
 * const stubData = await paymaster.getPaymasterStubData({
 *   sender: '0x...',
 *   callData: '0x...',
 *   context: encodeContext(poolId),
 *   chainId: 84532,
 *   entryPointAddress: '0x...'
 * });
 *
 * // Generate real paymaster data with proof
 * const paymasterData = await paymaster.getPaymasterData({
 *   sender: '0x...',
 *   callData: '0x...',
 *   context: encodeAbiParameters(...),
 *   chainId: 84532,
 *   entryPointAddress: '0x...'
 * });
 * ```
 */
export class PrepaidGasPaymaster {
  private subgraphClient: SubgraphClient;
  private config: PrepaidGasPaymasterConfig;
  private network: string;
  private chainConfig: any;

  // Service instances
  private proofGenerationService: ProofGenerationService;
  private merkleRootService: MerkleRootService;
  private paymasterDataService: PaymasterDataService;
  private gasEstimationService: GasEstimationService;

  constructor(config: PrepaidGasPaymasterConfig) {
    this.config = config;
    this.network = config.network;

    // Get chain configuration
    this.chainConfig = getChainConfig(this.network);
    if (!this.chainConfig) {
      throw new Error(`Unsupported network: ${this.network}`);
    }

    // Validate chain configuration
    const validation = validateChainConfig(this.network);
    if (!validation.isValid) {
      console.warn(
        `Chain configuration warnings for ${this.network}:`,
        validation.errors,
      );
    }

    // Initialize subgraph client
    const subgraphUrl = config.subgraphUrl || this.chainConfig.subgraphUrl;
    if (!subgraphUrl) {
      throw new Error(`No subgraph URL available for network: ${this.network}`);
    }

    this.subgraphClient = new SubgraphClient({
      subgraphUrl,
      network: {
        name: this.chainConfig.name,
        chainId: this.chainConfig.chainId,
        chainName: this.chainConfig.name,
        networkName: this.chainConfig.network,
        contracts: {
          paymaster: this.chainConfig.contracts.paymaster,
          verifier: this.chainConfig.contracts.verifier,
        },
      },
    });

    // Initialize services
    this.proofGenerationService = new ProofGenerationService();
    this.merkleRootService = new MerkleRootService();
    this.paymasterDataService = new PaymasterDataService();
    this.gasEstimationService = new GasEstimationService();
  }

  /**
   * Generate stub paymaster data for gas estimation
   *
   * This method creates dummy paymaster data that can be used to estimate
   * gas costs without requiring a real zero-knowledge proof.
   *
   * @param parameters - Parameters for generating stub data
   * @returns Promise resolving to paymaster stub data
   */
  async getPaymasterStubData(
    parameters: GetPaymasterStubDataV7Parameters,
  ): Promise<GetPaymasterStubDataReturnType> {
    return this.gasEstimationService.getStubData({
      parameters,
      paymasterDataService: this.paymasterDataService,
    });
  }

  /**
   * Generate real paymaster data with zero-knowledge proof
   *
   * This method creates actual paymaster data that includes a valid
   * zero-knowledge proof of pool membership.
   *
   * @param parameters - Parameters for generating paymaster data
   * @returns Promise resolving to encoded paymaster data
   */
  async getPaymasterData(parameters: GetPaymasterDataParameters): Promise<Hex> {
    if ("initCode" in parameters) {
      throw new Error("v6-style UserOperation with initCode is not supported.");
    }

    // Create UserOperation for processing
    const userOperation: UserOperation<"0.7"> = {
      ...parameters,
      sender: parameters.sender,
      nonce: parameters.nonce,
      callData: parameters.callData,
      callGasLimit: parameters.callGasLimit ?? 0n,
      verificationGasLimit: parameters.verificationGasLimit ?? 0n,
      preVerificationGas: parameters.preVerificationGas ?? 0n,
      maxFeePerGas: parameters.maxFeePerGas ?? 0n,
      maxPriorityFeePerGas: parameters.maxPriorityFeePerGas ?? 0n,
      signature: "0x",
    };

    // Get chain and create public client
    const chain = getChainById(parameters.chainId);
    if (!chain) throw new Error(`Unsupported chainId: ${parameters.chainId}`);

    const publicClient = createPublicClient({
      chain,
      transport: http(this.config.rpcUrl),
    });

    // Parse context to get paymaster details
    const parsedContext = this.paymasterDataService.parseContext(
      parameters.context,
    );

    if (!parsedContext.identityString) {
      throw new Error("Identity string is required for proof generation");
    }

    // Get message hash from contract
    const packedUserOpForHash = getPackedUserOperation(userOperation);
    const messageHash = await publicClient.readContract({
      abi: PREPAID_GAS_PAYMASTER_ABI,
      address: parsedContext.paymasterAddress,
      functionName: "getMessageHash",
      args: [packedUserOpForHash],
    });

    // Get pool members from subgraph
    const poolMembersResponse = await this.subgraphClient.getPoolMembers(
      parsedContext.poolId.toString(),
    );
    const poolMembers = poolMembersResponse.data.map((member) =>
      BigInt(member.identityCommitment),
    );

    // Get current merkle tree root
    const currentMerkleRoot = await publicClient.readContract({
      abi: PREPAID_GAS_PAYMASTER_ABI,
      address: parsedContext.paymasterAddress,
      functionName: "getMerkleTreeRoot",
      args: [parsedContext.poolId],
    });

    // Find the best merkle root index
    const rootIndexResult = await this.merkleRootService.findBestRootIndex({
      publicClient,
      paymasterAddress: parsedContext.paymasterAddress,
      poolId: parsedContext.poolId,
      currentMerkleRoot,
      subgraphClient: this.subgraphClient,
    });

    // Generate zero-knowledge proof
    const proofResult = await this.proofGenerationService.generateProof({
      identityString: parsedContext.identityString,
      poolMembers,
      messageHash: BigInt(messageHash),
      poolId: parsedContext.poolId,
    });

    // Generate paymaster data
    return this.paymasterDataService.generatePaymasterData({
      mode: PrepaidGasPaymasterMode.VALIDATION_MODE,
      poolId: parsedContext.poolId,
      proof: proofResult.proof,
      merkleRootIndex: rootIndexResult.index,
    });
  }

  /**
   * Get the subgraph client instance
   *
   * @returns The configured subgraph client
   */
  getSubgraphClient(): SubgraphClient {
    return this.subgraphClient;
  }

  /**
   * Get the current network configuration
   *
   * @returns Current network and chain configuration
   */
  getNetworkInfo() {
    return {
      network: this.network,
      chainConfig: this.chainConfig,
      subgraphUrl: this.subgraphClient.getNetworkMetadata().network,
    };
  }

  /**
   * Get service instances (for advanced usage)
   *
   * @returns Object containing all service instances
   */
  getServices() {
    return {
      proofGeneration: this.proofGenerationService,
      merkleRoot: this.merkleRootService,
      paymasterData: this.paymasterDataService,
      gasEstimation: this.gasEstimationService,
    };
  }
}
