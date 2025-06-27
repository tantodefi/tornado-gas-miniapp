/**
 * Payment flow and transaction-related type definitions
 * Single source of truth for payment processing, providers, and transaction data
 */

import type { PoolNetwork } from "./pool";
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
export interface PaymentPool {
  id: string;
  poolId: string;
  joiningFee: string; // String from API serialization (wei amount)
  membersCount: string;
  network: PoolNetwork;
}

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
    chainId: number;
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

/**
 * Payment transaction details for history
 */
export interface PaymentTransaction {
  id: string; // Unique transaction ID
  cardId: string; // Associated card ID
  poolId: string; // Pool ID
  amount: string; // Payment amount (ETH)
  provider: PaymentProvider; // Payment provider used
  transactionHash: string; // Blockchain transaction hash
  blockNumber?: number; // Block number
  gasUsed?: string; // Gas used
  timestamp: number; // Transaction timestamp
  status: "pending" | "confirmed" | "failed"; // Transaction status
}

/**
 * Payment analytics data
 */
export interface PaymentAnalytics {
  totalPayments: number; // Total number of payments
  totalVolume: string; // Total payment volume (ETH)
  averagePayment: string; // Average payment amount
  popularProvider: PaymentProvider; // Most used payment provider
  successRate: number; // Payment success rate (0-1)
}

/**
 * Payment fee estimation
 */
export interface PaymentFeeEstimate {
  joiningFee: string; // Pool joining fee (ETH)
  networkFee: string; // Estimated network fee (ETH)
  totalFee: string; // Total estimated fee (ETH)
  provider: PaymentProvider; // Provider used for estimate
}

/**
 * Payment method information
 */
export interface PaymentMethod {
  id: string; // Payment method ID
  provider: PaymentProvider; // Payment provider
  name: string; // Display name
  description: string; // Description
  icon?: string; // Icon URL or emoji
  enabled: boolean; // Whether method is available
  features: string[]; // Supported features
}
