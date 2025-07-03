/**
 * Network presets for PrepaidGasPaymaster
 *
 * These presets provide default configurations for supported networks,
 * including default subgraph URLs and network settings.
 * Updated to support multiple paymaster contracts per network.
 */
import {
  NetworkConfig,
  BASE_SEPOLIA_NETWORK,
  validateNetworkConfig,
} from "./config.js";

/**
 * Network preset configuration
 */
export interface NetworkPreset {
  /** The network configuration */
  network: NetworkConfig;
  /** Default subgraph URL for this network */
  defaultSubgraphUrl: string;
  /** Default RPC URL for this network (optional) */
  defaultRpcUrl?: string;
  /** Network description for documentation */
  description: string;
  /** Supported paymaster types on this network */
  supportedPaymasterTypes: Array<"GasLimited" | "OneTimeUse">;
}

/**
 * Base Sepolia network preset
 * Updated with new subgraph URL and multiple paymaster support
 */
export const BASE_SEPOLIA_PRESET: NetworkPreset = {
  network: BASE_SEPOLIA_NETWORK,
  defaultSubgraphUrl:
    "https://api.studio.thegraph.com/query/113435/prepaid-gas-paymaster-v2/version/latest",
  defaultRpcUrl: "https://sepolia.base.org",
  description:
    "Base Sepolia testnet with GasLimited and OneTimeUse paymasters - ideal for development and testing",
  supportedPaymasterTypes: ["GasLimited", "OneTimeUse"],
};

/**
 * All available network presets mapped by chain ID
 */
export const NETWORK_PRESETS: Record<number, NetworkPreset> = {
  [BASE_SEPOLIA_NETWORK.chainId]: BASE_SEPOLIA_PRESET,
} as const;

/**
 * All available network presets mapped by network name
 */
export const NETWORK_PRESETS_BY_NAME = {
  BASE_SEPOLIA: BASE_SEPOLIA_PRESET,
} as const;

/**
 * Get network preset by chain ID
 *
 * @param chainId - The chain ID to look up
 * @returns The network preset if found, undefined otherwise
 */
export function getNetworkPreset(chainId: number): NetworkPreset | undefined {
  return NETWORK_PRESETS[chainId];
}

/**
 * Get network preset by network name
 *
 * @param networkName - The network name to look up
 * @returns The network preset if found, undefined otherwise
 */
export function getNetworkPresetByName(
  networkName: keyof typeof NETWORK_PRESETS_BY_NAME,
): NetworkPreset | undefined {
  return NETWORK_PRESETS_BY_NAME[networkName];
}

/**
 * Get all supported chain IDs
 *
 * @returns Array of supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(NETWORK_PRESETS).map(Number);
}

/**
 * Get all supported network names
 *
 * @returns Array of supported network names
 */
export function getSupportedNetworkNames(): string[] {
  return Object.keys(NETWORK_PRESETS_BY_NAME);
}

/**
 * Validate if a chain ID is supported
 *
 * @param chainId - The chain ID to validate
 * @returns True if supported, false otherwise
 */
export function isSupportedChainId(chainId: number): boolean {
  return chainId in NETWORK_PRESETS;
}

/**
 * Get a helpful error message for unsupported networks
 *
 * @param chainId - The unsupported chain ID
 * @returns Formatted error message with supported alternatives
 */
export function getUnsupportedNetworkError(chainId: number): string {
  const supported = getSupportedChainIds();
  return `Unsupported network with chainId: ${chainId}. Supported networks: ${supported.join(", ")}`;
}

/**
 * Validate network preset configuration
 *
 * @param preset - The preset to validate
 * @returns Validation result with errors if any
 */
export function validateNetworkPreset(preset: NetworkPreset): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate network config first
  const networkValidation = validateNetworkConfig(preset.network);
  if (!networkValidation.isValid) {
    errors.push(...networkValidation.errors);
  }

  // Validate preset-specific fields
  if (!preset.defaultSubgraphUrl) {
    errors.push("Default subgraph URL is required");
  } else {
    try {
      new URL(preset.defaultSubgraphUrl);
    } catch {
      errors.push("Default subgraph URL must be a valid URL");
    }
  }

  if (preset.defaultRpcUrl) {
    try {
      new URL(preset.defaultRpcUrl);
    } catch {
      errors.push("Default RPC URL must be a valid URL");
    }
  }

  if (!preset.description || !preset.description.trim()) {
    errors.push("Description is required");
  }

  if (
    !preset.supportedPaymasterTypes ||
    preset.supportedPaymasterTypes.length === 0
  ) {
    errors.push("At least one supported paymaster type is required");
  }

  // Validate that supported paymaster types match actual network contracts
  if (preset.supportedPaymasterTypes && preset.network.contracts) {
    const hasGasLimited =
      preset.network.contracts.paymasters.gasLimited !== undefined;
    const hasOneTimeUse =
      preset.network.contracts.paymasters.oneTimeUse !== undefined;

    if (
      preset.supportedPaymasterTypes.includes("GasLimited") &&
      !hasGasLimited
    ) {
      errors.push(
        "GasLimited paymaster type is listed as supported but no contract address provided",
      );
    }

    if (
      preset.supportedPaymasterTypes.includes("OneTimeUse") &&
      !hasOneTimeUse
    ) {
      errors.push(
        "OneTimeUse paymaster type is listed as supported but no contract address provided",
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get preset configuration with validation
 *
 * @param chainId - The chain ID to get preset for
 * @returns The validated preset configuration
 * @throws Error if chain ID is not supported or preset is invalid
 */
export function getValidatedNetworkPreset(chainId: number): NetworkPreset {
  const preset = getNetworkPreset(chainId);

  if (!preset) {
    throw new Error(getUnsupportedNetworkError(chainId));
  }

  const validation = validateNetworkPreset(preset);
  if (!validation.isValid) {
    throw new Error(
      `Invalid network preset for chainId ${chainId}: ${validation.errors.join(", ")}`,
    );
  }

  return preset;
}

/**
 * Get paymaster contracts for a specific network
 *
 * @param chainId - The chain ID to get contracts for
 * @returns Array of paymaster contracts or empty array if network not supported
 */
export function getPaymasterContracts(chainId: number): Array<{
  address: string;
  type: "GasLimited" | "OneTimeUse";
  startBlock: number;
}> {
  const preset = getNetworkPreset(chainId);
  if (!preset) {
    return [];
  }

  const contracts = [];

  if (preset.network.contracts.paymasters.gasLimited) {
    contracts.push({
      address: preset.network.contracts.paymasters.gasLimited.address,
      type: "GasLimited" as const,
      startBlock: preset.network.contracts.paymasters.gasLimited.startBlock,
    });
  }

  if (preset.network.contracts.paymasters.oneTimeUse) {
    contracts.push({
      address: preset.network.contracts.paymasters.oneTimeUse.address,
      type: "OneTimeUse" as const,
      startBlock: preset.network.contracts.paymasters.oneTimeUse.startBlock,
    });
  }

  return contracts;
}

/**
 * Get paymaster contract by type for a specific network
 *
 * @param chainId - The chain ID
 * @param type - Paymaster type
 * @returns Paymaster contract info or undefined
 */
export function getPaymasterContract(
  chainId: number,
  type: "GasLimited" | "OneTimeUse",
): { address: string; startBlock: number } | undefined {
  const contracts = getPaymasterContracts(chainId);
  const contract = contracts.find((c) => c.type === type);

  if (!contract) {
    return undefined;
  }

  return {
    address: contract.address,
    startBlock: contract.startBlock,
  };
}

/**
 * Check if a network supports a specific paymaster type
 *
 * @param chainId - The chain ID
 * @param type - Paymaster type
 * @returns True if the network supports the specified paymaster type
 */
export function supportsPaymasterType(
  chainId: number,
  type: "GasLimited" | "OneTimeUse",
): boolean {
  const preset = getNetworkPreset(chainId);
  return preset ? preset.supportedPaymasterTypes.includes(type) : false;
}

/**
 * Get supported paymaster types for a network
 *
 * @param chainId - The chain ID
 * @returns Array of supported paymaster types
 */
export function getSupportedPaymasterTypes(
  chainId: number,
): Array<"GasLimited" | "OneTimeUse"> {
  const preset = getNetworkPreset(chainId);
  return preset ? preset.supportedPaymasterTypes : [];
}
