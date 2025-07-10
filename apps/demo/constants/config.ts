// file :prepaid-gas-website/apps/demo/constants/config.ts
import type { Address } from "viem";
import { BASE_SEPOLIA_PRESET } from "@workspace/data";

// Contract addresses - these need to be public for frontend wallet interactions
export const CONTRACTS = {
  counter: (process.env.NEXT_PUBLIC_COUNTER_ADDRESS ||
    "0x18B5EF94Bd6212d4764853142215F917c353011e") as Address,
  // ✨ NEW: Use preset instead of hardcoded value
  paymaster: (process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS ||
    BASE_SEPOLIA_PRESET.network.contracts.paymasters.gasLimited) as Address,
} as const;

// ✨ NEW: Network configuration from preset instead of hardcoded values
export const NETWORKS = {
  baseSepolia: {
    name: BASE_SEPOLIA_PRESET.network.chainName,
    chainId: BASE_SEPOLIA_PRESET.network.chainId,
    blockExplorer: "https://sepolia.basescan.org",
  },
} as const;

// Client-side API configuration - public for frontend
export const CLIENT_CONFIG = {
  bundler: process.env.NEXT_PUBLIC_BUNDLER_URL || "http://localhost:4337",
  // ✨ NEW: Use preset default subgraph URL as fallback
  subgraph:
    process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
    BASE_SEPOLIA_PRESET.defaultSubgraphUrl,
} as const;

// Server-side API configuration - secure, only available on server
export const SERVER_CONFIG = {
  subgraph:
    process.env.SUBGRAPH_URL ||
    process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
    BASE_SEPOLIA_PRESET.defaultSubgraphUrl, // ✨ NEW: Better fallback to preset default
} as const;

// Storage keys - can be public
export const STORAGE_KEYS = {
  paymasterConfig: "paymaster-config",
  burnerSignerKey: "burner-signer-key",
} as const;

// Backwards compatibility - will be removed after migration
export const API_CONFIG = {
  bundler: CLIENT_CONFIG.bundler,
  subgraph: SERVER_CONFIG.subgraph, // This will only work server-side now
} as const;
