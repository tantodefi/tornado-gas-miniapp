/**
 * Prepaid Gas Paymaster SDK - Privacy-preserving paymaster client for Account Abstraction
 *
 * This package provides a TypeScript SDK for integrating with privacy-preserving
 * gas payments using zero-knowledge proofs and Semaphore protocol.
 *
 * ⚠️ PRIVACY NOTICE: Transactions within the same pool are linkable via nullifiers.
 * For unlinkable transactions, users must use different identities across pools.
 *
 * @packageDocumentation
 */

// Main client exports
export { PrepaidGasPaymaster } from "./client/PrepaidGasPaymaster";

// Network configuration helpers
export {
  BASE_SEPOLIA_NETWORK,
  BASE_MAINNET_NETWORK,
  NETWORKS,
  getNetworkByChainId,
  validateNetworkConfig,
} from "./networks";

// Utility exports
export {
  encodeContext,
  encodePaymasterContext,
  generatePaymasterData,
  getChainById,
  PrepaidGasPaymasterMode,
  encodeConfig,
  decodeConfig,
  validateDataStructure,
} from "./utils";

// Constants exports
export {
  PREPAID_GAS_PAYMASTER_ABI,
  POST_OP_GAS_LIMIT,
  POOL_ROOT_HISTORY_SIZE,
  PAYMASTER_VALIDATION_GAS_OFFSET,
  PAYMASTER_POSTOP_GAS_OFFSET,
  PAYMASTER_DATA_OFFSET,
} from "./constants";

// Type exports
export type {
  PrepaidGasPaymasterConfig,
  NetworkConfig,
  GetPaymasterStubDataV7Parameters,
  PoolMembershipInfo,
  PoolMembershipProof,
  PaymasterConfig,
  PaymasterData,
  UserGasData,
  PoolData,
  PoolFields,
} from "./types";

// Service exports (for advanced usage)
export { ProofGenerationService } from "./services/ProofGenerationService.js";
export { MerkleRootService } from "./services/MerkleRootService.js";
export { PaymasterDataService } from "./services/PaymasterDataService.js";
export { GasEstimationService } from "./services/GasEstimationService.js";

// Service types
export type {
  ProofGenerationParams,
  ProofGenerationResult,
  FindRootIndexParams,
  FindRootIndexResult,
  PaymasterDataParams,
  StubDataParams,
  GasEstimationParams,
  GasEstimationResult,
} from "./services/index.js";

// Version
export const VERSION = "1.0.0";
