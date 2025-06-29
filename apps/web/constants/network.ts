//file: prepaid-gas-website/apps/web/constants/network.ts

/**
 * Network configuration constants
 * Single source of truth for network-related configuration
 */

export const NETWORK_CONFIG = {
  // Default network for the application
  DEFAULT_CHAIN_ID: parseInt(process.env.CHAIN_ID || "84532", 10), // Base Sepolia

  // Base Sepolia configuration
  BASE_SEPOLIA: {
    chainId: 84532,
    name: "Base",
    chainName: "Base Sepolia",
    networkName: "Base Sepolia",
    contracts: {
      paymaster:
        process.env.PAYMASTER_CONTRACT ||
        "0xAAdb7b165057fF59a1f2a93C83CE6a183891EAf6",
    },
  },

  // Base Mainnet configuration (for future use)
  BASE_MAINNET: {
    chainId: 8453,
    name: "Base",
    chainName: "Base Mainnet",
    networkName: "Base Mainnet",
    contracts: {
      paymaster:
        process.env.PAYMASTER_CONTRACT ||
        "0x0000000000000000000000000000000000000000", // Update when deployed
    },
  },
} as const;

/**
 * Get network configuration by chain ID
 */
export function getNetworkConfig(chainId: number) {
  switch (chainId) {
    case 84532:
      return NETWORK_CONFIG.BASE_SEPOLIA;
    case 8453:
      return NETWORK_CONFIG.BASE_MAINNET;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

/**
 * Get the default network configuration
 */
export function getDefaultNetworkConfig() {
  return getNetworkConfig(NETWORK_CONFIG.DEFAULT_CHAIN_ID);
}

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  POOLS_TTL: parseInt(process.env.POOLS_CACHE_TTL || "300", 10), // 5 minutes
  POOL_DETAILS_TTL: parseInt(process.env.POOL_DETAILS_CACHE_TTL || "60", 10), // 1 minute
  POOL_MEMBERS_TTL: 120, // 2 minutes (member lists can change frequently)
} as const;
