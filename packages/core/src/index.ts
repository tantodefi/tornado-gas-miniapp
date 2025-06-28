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
// Client exports
export type {
  PrepaidGasPaymasterConfig,
  GetPaymasterStubDataV7Parameters,
} from "./client";

export {
  BASE_SEPOLIA_PRESET,
  BASE_MAINNET_PRESET,
  NETWORK_PRESETS,
  NETWORK_PRESETS_BY_NAME,
  getNetworkPreset,
  getNetworkPresetByName,
  getSupportedChainIds,
  getSupportedNetworkNames,
  isSupportedChainId,
  getUnsupportedNetworkError,
  validateNetworkPreset,
  getValidatedNetworkPreset,
} from "./presets";

export type { NetworkPreset } from "./presets";
export type { NetworkConfig } from "./presets/config";
// Utility exports
export {
  encodePaymasterContext,
  parsePaymasterContext,
  PrepaidGasPaymasterMode,
  getChainById,
} from "./utils";
export type { ParsedPaymasterContext } from "./utils";

// Constants exports
export { PREPAID_GAS_PAYMASTER_ABI, POOL_ROOT_HISTORY_SIZE } from "./constants";

export type { PoolMembershipProof } from "./proof";

// Version
export const VERSION = "1.0.0";
