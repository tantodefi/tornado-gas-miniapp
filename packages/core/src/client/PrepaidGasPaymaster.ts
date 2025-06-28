import {
  GetPaymasterDataParameters,
  GetPaymasterDataReturnType,
  GetPaymasterStubDataReturnType,
  UserOperation,
} from "viem/account-abstraction";
import { createPublicClient, http } from "viem";
import { getPackedUserOperation } from "permissionless";

// Use new data package
import { SubgraphClient } from "@workspace/data";

// Import our new services
import { ProofGenerationService } from "../services/ProofGenerationService";
import { MerkleRootService } from "../services/MerkleRootService";
import { PaymasterDataService } from "../services/PaymasterDataService";
import { GasEstimationService } from "../services/GasEstimationService";

import {
  getChainById,
  parsePaymasterContext,
  PrepaidGasPaymasterMode,
} from "../utils";
import { PREPAID_GAS_PAYMASTER_ABI } from "../constants";
import {
  PrepaidGasPaymasterConfig,
  GetPaymasterStubDataV7Parameters,
} from "./";
import {
  getValidatedNetworkPreset,
  getUnsupportedNetworkError,
  type NetworkPreset,
} from "../presets";
import { NetworkConfig } from "../presets/config";

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
 * const paymaster = new PrepaidGasPaymaster({
 *   subgraphUrl: "https://api.studio.thegraph.com/query/your-subgraph",
 *   network: {
 *     name: "Base",
 *     chainId: 84532,
 *     chainName: "Base Sepolia",
 *     networkName: "Sepolia",
 *     contracts: {
 *       paymaster: "0xAAdb7b165057fF59a1f2a93C83CE6a183891EAf6",
 *     },
 *   },
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
 * ```
 */
export class PrepaidGasPaymaster {
  private subgraphClient: SubgraphClient;
  private config: PrepaidGasPaymasterConfig;
  private networkConfig: NetworkConfig;

  // Service instances
  private proofGenerationService: ProofGenerationService;
  private merkleRootService: MerkleRootService;
  private paymasterDataService: PaymasterDataService;
  private gasEstimationService: GasEstimationService;

  constructor(config: PrepaidGasPaymasterConfig) {
    this.config = config;
    this.networkConfig = config.network;

    // Validate required configuration
    this.validateConfig(config);

    // Initialize subgraph client with explicit configuration
    this.subgraphClient = new SubgraphClient({
      subgraphUrl: config.subgraphUrl,
      network: {
        name: this.networkConfig.name,
        chainId: this.networkConfig.chainId,
        chainName: this.networkConfig.chainName,
        networkName: this.networkConfig.networkName,
        contracts: {
          paymaster: this.networkConfig.contracts.paymaster,
          verifier: this.networkConfig.contracts.verifier,
        },
      },
    });

    // Initialize services
    this.proofGenerationService = new ProofGenerationService();
    this.merkleRootService = new MerkleRootService();
    this.paymasterDataService = new PaymasterDataService();
    this.gasEstimationService = new GasEstimationService();

    if (config.debug) {
      console.log("✅ PrepaidGasPaymaster initialized:", {
        subgraphUrl: config.subgraphUrl,
        network: this.networkConfig.name,
        chainId: this.networkConfig.chainId,
        paymasterAddress: this.networkConfig.contracts.paymaster,
      });
    }
  }

  /**
   * Create a PrepaidGasPaymaster instance for any supported network by chain ID
   *
   * @param chainId - The chain ID to create paymaster for
   * @param options - Optional configuration overrides
   * @returns Configured PrepaidGasPaymaster instance
   *
   * @example
   * ```typescript
   * // Create for Base Sepolia using chain ID
   * const paymaster = PrepaidGasPaymaster.createForNetwork(84532);
   *
   * // Create for Base Mainnet with custom options
   * const paymaster = PrepaidGasPaymaster.createForNetwork(8453, {
   *   subgraphUrl: "https://custom-subgraph.com",
   *   debug: true
   * });
   * ```
   */
  static createForNetwork(
    chainId: number,
    options: {
      /** Custom subgraph URL (optional, uses default if not provided) */
      subgraphUrl?: string;
      /** Enable debug logging */
      debug?: boolean;
      /** Custom RPC URL */
      rpcUrl?: string;
      /** Request timeout in milliseconds */
      timeout?: number;
    } = {},
  ): PrepaidGasPaymaster {
    let preset: NetworkPreset;

    try {
      preset = getValidatedNetworkPreset(chainId);
    } catch (error) {
      throw new Error(getUnsupportedNetworkError(chainId));
    }

    const { subgraphUrl, ...restOptions } = options;

    // Use provided subgraph URL or fall back to preset default
    const finalSubgraphUrl = subgraphUrl || preset.defaultSubgraphUrl;

    if (!finalSubgraphUrl) {
      throw new Error(
        `No subgraph URL available for network ${preset.network.name} (chainId: ${chainId}). Please provide one in options.subgraphUrl`,
      );
    }

    return new PrepaidGasPaymaster({
      subgraphUrl: finalSubgraphUrl,
      network: preset.network,
      ...restOptions,
    });
  }

  /**
   * Validate the provided configuration
   */
  private validateConfig(config: PrepaidGasPaymasterConfig): void {
    if (!config.subgraphUrl || !config.subgraphUrl.trim()) {
      throw new Error("subgraphUrl is required and must be a valid URL");
    }

    if (!config.network) {
      throw new Error("network configuration is required");
    }

    const { network } = config;

    if (!network.name || !network.name.trim()) {
      throw new Error("network.name is required");
    }

    if (!network.chainId || network.chainId <= 0) {
      throw new Error(
        "network.chainId is required and must be a positive number",
      );
    }

    if (!network.chainName || !network.chainName.trim()) {
      throw new Error("network.chainName is required");
    }

    if (!network.networkName || !network.networkName.trim()) {
      throw new Error("network.networkName is required");
    }

    if (!network.contracts?.paymaster) {
      throw new Error("network.contracts.paymaster address is required");
    }

    // Validate that the subgraph URL looks like a valid URL
    try {
      new URL(config.subgraphUrl);
    } catch {
      throw new Error("subgraphUrl must be a valid URL");
    }
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
  async getPaymasterData(
    parameters: GetPaymasterDataParameters,
  ): Promise<GetPaymasterDataReturnType> {
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
    const chain = getChainById(this.networkConfig.chainId);
    if (!chain) {
      throw new Error(`Unsupported chainId: ${this.networkConfig.chainId}`);
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(this.config.rpcUrl),
    });

    // Parse context to get paymaster details
    const parsedContext = parsePaymasterContext(
      parameters.context as `0x${string}`,
    );

    if (!parsedContext.identityHex) {
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
      identityHex: parsedContext.identityHex,
      poolMembers,
      messageHash: BigInt(messageHash),
      poolId: parsedContext.poolId,
    });

    // Generate paymaster data
    const paymasterData = await this.paymasterDataService.generatePaymasterData(
      {
        mode: PrepaidGasPaymasterMode.VALIDATION_MODE,
        poolId: parsedContext.poolId,
        proof: proofResult.proof,
        merkleRootIndex: rootIndexResult.index,
      },
    );

    return {
      paymaster: parsedContext.paymasterAddress,
      paymasterData: paymasterData,
    };
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
   * @returns Current network configuration
   */
  getNetworkInfo() {
    return {
      subgraphUrl: this.config.subgraphUrl,
      network: this.networkConfig,
      rpcUrl: this.config.rpcUrl,
    };
  }
}
