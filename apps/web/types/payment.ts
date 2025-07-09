//file:prepaid-gas-website/apps/web/types/payment.ts
/**
 * Payment flow and transaction-related type definitions
 * Single source of truth for payment processing, providers, and transaction data
 */

import type { Pool } from "./pool";
import type { PoolCard } from "./card";

/**
 * Payment provider options
 */
export type PaymentProvider = "daimo" | "rainbow" | "auto";

/**
 * Payment state enumeration for UI state management
 */
export type PaymentState =
  | "idle" // Ready to pay
  | "connecting" // Connecting wallet/provider
  | "pending" // Payment in progress
  | "confirming" // Waiting for blockchain confirmation
  | "activating" // Activating card after payment
  | "success" // Payment completed and card activated
  | "error"; // Payment failed

/**
 * Payment pool interface for payment operations
 */
export type PaymentPool = Pool;

/**
 * Payment data required for pool joining transaction
 */
export interface PaymentData {
  calldata: `0x${string}`; // Transaction calldata for pool joining
  identity: any; // Semaphore Identity object
  poolId: string; // Pool ID being joined
  cardId: string; // Card ID that will be activated
}

/**
 * Payment completion details for card activation
 */
export interface PaymentDetails {
  transactionHash: string; // Transaction hash of successful payment
  pool: PaymentPool; // Pool that was joined
  card: PoolCard; // Card that was used/activated
  network: {
    // Network information
    name: string;
    chainId: string;
  };
  timestamp: number; // Timestamp of payment completion
  blockNumber?: number; // Block number (if available)
  gasUsed?: string; // Gas used (if available)
}

/**
 * Payment error details
 */
export interface PaymentError {
  message: string; // Error message for user display
  provider: PaymentProvider; // Payment provider that failed
  poolId: string; // Pool ID that failed to join
  cardId: string; // Card ID that failed to activate
  timestamp: number; // Error timestamp
  cause?: unknown; // Original error cause
}

/**
 * Payment provider callback functions
 */
export interface PaymentCallbacks {
  onPaymentStarted: (paymentData: PaymentData) => void;
  onPaymentCompleted: (details: PaymentDetails) => void;
  onPaymentError: (error: PaymentError) => void;
}

/**
 * Daimo payment event structure
 */
export interface DaimoPaymentEvent {
  transactionHash?: string;
  hash?: string;
  txHash?: string;
  success?: boolean;
  paymentData?: unknown;
}

/**
 * Rainbow/Wagmi transaction event structure
 */
export interface RainbowTransactionEvent {
  hash: string;
  transactionHash?: string;
  success: boolean;
  blockNumber?: number;
  gasUsed?: string;
}

/**
 * Wagmi error structure
 */
export interface WagmiError {
  name: string;
  message: string;
  cause?: unknown;
}

/**
 * Daimo error structure
 */
export interface DaimoError {
  name?: string;
  message: string;
  cause?: unknown;
}

/**
 * Payment manager configuration
 */
export interface PaymentManagerConfig {
  pool: PaymentPool; // Pool to join
  card: PoolCard; // Existing pending card to activate
  provider?: PaymentProvider; // Payment provider preference
  callbacks: PaymentCallbacks; // Payment callbacks
}

/**
 * Payment button props for provider-specific buttons
 */
export interface PaymentButtonProps {
  pool: PaymentPool; // Pool being joined
  card: PoolCard; // Card being activated
  getPaymentData: () => PaymentData; // Function to generate payment data
  callbacks: {
    // Payment event callbacks
    handlePaymentStarted: (paymentData: PaymentData) => void;
    handlePaymentCompleted: (
      event: DaimoPaymentEvent | RainbowTransactionEvent,
    ) => void;
    handlePaymentError: (error: DaimoError | WagmiError) => void;
  };
}

/**
 * Payment configuration for different providers
 */
export interface PaymentProviderConfig {
  daimo?: {
    appId: string;
    enabled: boolean;
  };
  rainbow?: {
    projectId: string;
    enabled: boolean;
  };
}
