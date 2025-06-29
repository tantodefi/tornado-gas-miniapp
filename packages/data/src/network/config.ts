/**
 * Network configurations for supported blockchain networks
 *
 * This file contains the basic network configuration data including
 * chain IDs, contract addresses, and network metadata.
 */

/**
 * Network configuration interface
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
    paymaster: `0x${string}`;
    /** Optional verifier contract address */
    verifier?: `0x${string}`;
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
