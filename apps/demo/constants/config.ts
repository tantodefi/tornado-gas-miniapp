import type { Address } from "viem";

// Contract addresses - these need to be public for frontend wallet interactions
export const CONTRACTS = {
  counter: (process.env.NEXT_PUBLIC_COUNTER_ADDRESS ||
    "0x18B5EF94Bd6212d4764853142215F917c353011e") as Address,
  paymaster: (process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS ||
    "0xAAdb7b165057fF59a1f2a93C83CE6a183891EAf6") as Address,
} as const;

// Network configuration - public for frontend
export const NETWORKS = {
  baseSepolia: {
    name: "Base Sepolia",
    chainId: 84532,
    blockExplorer: "https://sepolia.basescan.org",
  },
} as const;

// Client-side API configuration - public for frontend
export const CLIENT_CONFIG = {
  bundler: process.env.NEXT_PUBLIC_BUNDLER_URL || "http://localhost:4337",
  subgraph: process.env.NEXT_PUBLIC_SUBGRAPH_URL || "", // Made public for PrepaidGasPaymaster
} as const;

// Server-side API configuration - secure, only available on server
export const SERVER_CONFIG = {
  subgraph:
    process.env.SUBGRAPH_URL || process.env.NEXT_PUBLIC_SUBGRAPH_URL || "", // Fallback to public version
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
