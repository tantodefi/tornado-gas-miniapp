// packages/core/src/networks/index.ts
/**
 * Common network configurations for the PrepaidGasPaymaster
 *
 * These are helper configurations that users can use, but they still need to
 * provide their own subgraphUrl when creating the PrepaidGasPaymaster instance.
 */

import { Address } from "viem";

/**
 * Network configuration for the paymaster
 */
export interface NetworkConfig {
  /** Network name (e.g., "Base") */
  name: string;
  /** Chain ID (e.g., 84532 for Base Sepolia) */
  chainId: number;
  /** Chain name (e.g., "Base Sepolia") */
  chainName: string;
  /** Network name (e.g., "Sepolia") */
  networkName: string;
  /** Contract addresses for this network */
  contracts: {
    /** Paymaster contract address */
    paymaster: Address;
    /** Optional verifier contract address */
    verifier?: Address;
  };
}

/**
 * Base Sepolia network configuration
 */
export const BASE_SEPOLIA_NETWORK: NetworkConfig = {
  name: "Base",
  chainId: 84532,
  chainName: "Base Sepolia",
  networkName: "Sepolia",
  contracts: {
    paymaster: "0xAAdb7b165057fF59a1f2a93C83CE6a183891EAf6",
    // verifier: "0x...", // Add when available
  },
};

/**
 * Base Mainnet network configuration
 */
export const BASE_MAINNET_NETWORK: NetworkConfig = {
  name: "Base",
  chainId: 8453,
  chainName: "Base Mainnet",
  networkName: "Mainnet",
  contracts: {
    paymaster: "0x0000000000000000000000000000000000000000", // TODO: Add actual address when deployed
    // verifier: "0x...", // Add when available
  },
};

/**
 * All available network configurations
 */
export const NETWORKS = {
  BASE_SEPOLIA: BASE_SEPOLIA_NETWORK,
  BASE_MAINNET: BASE_MAINNET_NETWORK,
} as const;

/**
 * Get network configuration by chain ID
 */
export function getNetworkByChainId(
  chainId: number,
): NetworkConfig | undefined {
  return Object.values(NETWORKS).find((network) => network.chainId === chainId);
}

/**
 * Validate network configuration
 */
export function validateNetworkConfig(network: NetworkConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!network.name || !network.name.trim()) {
    errors.push("Network name is required");
  }

  if (!network.chainId || network.chainId <= 0) {
    errors.push("Chain ID is required and must be positive");
  }

  if (!network.chainName || !network.chainName.trim()) {
    errors.push("Chain name is required");
  }

  if (!network.networkName || !network.networkName.trim()) {
    errors.push("Network name is required");
  }

  if (!network.contracts?.paymaster) {
    errors.push("Paymaster contract address is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
