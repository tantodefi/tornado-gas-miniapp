//file:prepaid-gas-website/apps/web/types/card.ts
/**
 * Card and identity-related type definitions
 * Updated to use new field names from data package
 */

import type { PoolNetwork } from "./pool";

/**
 * Card status enumeration
 */
export type CardStatus = "pending-topup" | "active";

/**
 * Identity information for a card
 */
export interface CardIdentity {
  mnemonic: string; // BIP39 12-word recovery phrase
  privateKey: string; // Derived private key
  commitment: string; // Semaphore identity commitment
}

/**
 * Pool details stored with the card
 * Updated to use new field names from data package
 */
export interface CardPoolDetails {
  joiningFee: string;
  memberCount: string; // Updated from membersCount
  network: PoolNetwork;
}

/**
 * Complete pool card interface for IndexedDB storage
 */
export interface PoolCard {
  id: string; // Unique card ID (PGC-xxxxx format)
  poolId: string; // Pool ID this card belongs to
  poolDetails: CardPoolDetails; // Pool information at creation time
  identity: CardIdentity; // Cryptographic identity data
  paymasterContract: string; // Paymaster contract address
  paymasterContext: string; // Encoded context for demo app configuration
  createdAt: string; // ISO timestamp of creation
  status: CardStatus; // Current card status
  expiresAt: string; // ISO timestamp of expiration

  // Optional fields for active cards
  joinedAt?: string; // ISO timestamp when joined pool
  balance?: string; // Current card balance (ETH)
}

/**
 * Result of identity generation process
 */
export interface GenerateIdentityResult {
  cardId: string; // Generated card ID
  mnemonic: string; // BIP39 recovery phrase
  privateKey: string; // Derived private key
  commitment: string; // Identity commitment
  identity: any; // Semaphore Identity object
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
 * Card statistics for dashboard
 */
export interface CardStats {
  total: number; // Total number of cards
  active: number; // Number of active cards
  pending: number; // Number of pending cards
  totalValue: number; // Total ETH value across all cards
}

/**
 * Card creation parameters
 */
export interface CreateCardParams {
  poolId: string;
  poolDetails: CardPoolDetails;
  paymasterContract: string;
}

/**
 * Card update parameters
 */
export interface UpdateCardParams {
  balance?: string;
  status?: CardStatus;
  joinedAt?: string;
}

/**
 * Card filter options
 */
export interface CardFilterOptions {
  status?: CardStatus;
  poolId?: string;
  network?: string;
  createdAfter?: string;
  createdBefore?: string;
}

/**
 * Card backup data structure
 */
export interface CardBackupData {
  version: string;
  exportedAt: string;
  cards: PoolCard[];
}

/**
 * Card security validation result
 */
export interface CardSecurityCheck {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Card transaction record
 */
export interface CardTransaction {
  id: string;
  cardId: string;
  type: "topup" | "spend" | "refund";
  amount: string;
  timestamp: string;
  status: "pending" | "completed" | "failed";
  transactionHash?: string;
}

/**
 * Card usage statistics
 */
export interface CardUsageStats {
  cardId: string;
  totalSpent: string;
  transactionCount: number;
  averageTransactionSize: string;
  lastUsed?: string;
  poolUtilization: number; // Percentage of pool gas used
}
