//src/constants/chains.ts
import type { Address } from "viem";

/**
 * Chain configuration interface
 */
export interface ChainConfig {
  id: string;
  name: string;
  network: string;
  chainId: number;
  icon?: string;
  contracts: {
    paymaster: Address;
    verifier?: Address;
  };
  subgraphUrl: string;
}

/**
 * Environment-based configuration
 */
const getEnvVar = (key: string, defaultValue?: string): string => {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || defaultValue || "";
  }
  return defaultValue || "";
};

/**
 * Supported chain configurations
 */
export const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  "base-sepolia": {
    id: "base-sepolia",
    name: "Base",
    network: "Sepolia",
    chainId: 84532,
    icon: "/chains/base/Base_Network_Logo.png",
    contracts: {
      paymaster: "0xAAdb7b165057fF59a1f2a93C83CE6a183891EAf6" as Address,
    },
    subgraphUrl: getEnvVar("NEXT_PUBLIC_BASE_SEPOLIA_SUBGRAPH_URL", ""),
  },
} as const;

/**
 * Supported chains for UI display
 */
export const supportedChains: ChainConfig[] = Object.values(CHAIN_CONFIGS);

/**
 * Default chain (Base Sepolia)
 */
export const DEFAULT_CHAIN = CHAIN_CONFIGS["base-sepolia"];

/**
 * Get chain configuration by ID
 */
export function getChainConfig(chainId: string): ChainConfig | undefined {
  return CHAIN_CONFIGS[chainId];
}

/**
 * Get chain configuration by chain ID number
 */
export function getChainConfigByChainId(
  chainId: number,
): ChainConfig | undefined {
  return Object.values(CHAIN_CONFIGS).find(
    (config) => config.chainId === chainId,
  );
}

/**
 * Validate chain configuration
 */
export function validateChainConfig(chainId: string): {
  isValid: boolean;
  errors: string[];
} {
  const config = getChainConfig(chainId);
  const errors: string[] = [];

  if (!config) {
    errors.push(`Unsupported chain: ${chainId}`);
    return { isValid: false, errors };
  }

  if (!config.subgraphUrl) {
    errors.push(`Missing subgraph URL for chain: ${chainId}`);
  }

  if (!config.contracts.paymaster) {
    errors.push(`Missing paymaster address for chain: ${chainId}`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): string[] {
  return Object.keys(CHAIN_CONFIGS);
}
