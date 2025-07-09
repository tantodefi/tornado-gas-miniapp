//file:prepaid-gas-website/apps/web/types/card.ts
/**
 * Card and identity-related type definitions
 * REFACTORED: Clean, minimal storage with all needed data
 */

import { Identity } from "@semaphore-protocol/identity";

/**
 * Card status enumeration - SIMPLIFIED: Only active cards
 */
export type CardStatus = "active";

/**
 * Identity information for a card
 */
export interface CardIdentity {
  mnemonic: string; // BIP39 12-word recovery phrase
  privateKey: string; // Derived private key
  commitment: string; // Semaphore identity commitment
}

/**
 * Minimal pool information stored with card - NEW
 */
export interface CardPoolInfo {
  poolId: string;
  joiningFee: string; // Wei amount paid to join
  network: string; // "base-sepolia", "base", etc.
  paymasterType: "GasLimited" | "OneTimeUse"; // For display purposes
}

/**
 * Complete pool card interface for IndexedDB storage - REFACTORED
 */
export interface PoolCard {
  id: string; // Unique card ID
  poolInfo: CardPoolInfo; // Minimal pool information
  identity: CardIdentity; // Cryptographic identity data
  paymasterContract: string; // Paymaster contract address
  paymasterContext: string; // Encoded context for demo app configuration

  // Transaction data - NEW: Store all payment details
  transactionHash: string; // Required: Transaction hash of purchase
  blockNumber?: number; // Block number where transaction was mined
  gasUsed?: string; // Gas used for the transaction
  chainId: string; // Network chain ID ("84532", "8453", etc.)

  // Timestamps - RENAMED for clarity
  purchasedAt: string; // ISO timestamp when card was purchased
  expiresAt: string; // ISO timestamp of expiration

  // Card state
  status: CardStatus; // Always "active" (no pending state)
  balance: string; // Current card balance (ETH)
}

/**
 * Result of identity generation process
 */
export interface GenerateIdentityResult {
  cardId: string; // Generated card ID
  mnemonic: string; // BIP39 recovery phrase
  privateKey: string; // Derived private key
  commitment: string; // Identity commitment
  identity: Identity; // Semaphore Identity object
  expiresAt: string; // Expiration timestamp
}

/**
 * Formatted mnemonic word for display
 */
export interface MnemonicWord {
  index: number; // Word position (1-12)
  word: string; // The actual word
}

/**
 * Card statistics for dashboard - SIMPLIFIED: No pending counts
 */
export interface CardStats {
  total: number; // Total number of cards
  totalValue: number; // Total ETH value across all cards
}

/**
 * Card creation parameters - UPDATED
 */
export interface CreateCardParams {
  poolInfo: CardPoolInfo;
  paymasterContract: string;
  transactionHash: string;
  chainId: string;
  blockNumber?: number;
  gasUsed?: string;
}

/**
 * Card update parameters - SIMPLIFIED
 */
export interface UpdateCardParams {
  balance?: string;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
}

/**
 * Card filter options - UPDATED
 */
export interface CardFilterOptions {
  poolId?: string;
  network?: string;
  chainId?: string;
  purchasedAfter?: string;
  purchasedBefore?: string;
}
