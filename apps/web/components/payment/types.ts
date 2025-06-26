// apps/web/components/payment/types.ts

import { Identity } from "@semaphore-protocol/identity";
import { PoolCard } from "@/lib/storage/indexed-db-storage";

/**
 * Pool interface for payment operations
 * Matches the current pool structure from API
 */
export interface PaymentPool {
  id: string;
  poolId: string;
  joiningFee: string; // String from API serialization (wei amount)
  membersCount: string;
  network: {
    name: string;
    chainId: number;
    chainName: string;
    networkName: string;
    contracts: {
      paymaster: string;
      verifier?: string;
    };
  };
}

/**
 * Payment data required for pool joining transaction
 * Uses existing card identity instead of generating new one
 */
export interface PaymentData {
  /** Transaction calldata for pool joining */
  calldata: `0x${string}`;
  /** Existing identity from pending card */
  identity: Identity;
  /** Pool ID being joined */
  poolId: string;
  /** Card ID that will be activated */
  cardId: string;
}

/**
 * Payment completion details
 * Used to activate pending card after successful payment
 */
export interface PaymentDetails {
  /** Transaction hash of successful payment */
  transactionHash: string;
  /** Pool that was joined */
  pool: PaymentPool;
  /** Card that was used/activated */
  card: PoolCard;
  /** Network information */
  network: {
    name: string;
    chainId: number;
  };
  /** Timestamp of payment completion */
  timestamp: number;
  /** Block number (if available) */
  blockNumber?: number;
  /** Gas used (if available) */
  gasUsed?: string;
}

/**
 * Payment error details
 */
export interface PaymentError {
  /** Error message for user display */
  message: string;
  /** Payment provider that failed */
  provider: "daimo" | "rainbow";
  /** Pool ID that failed to join */
  poolId: string;
  /** Card ID that failed to activate */
  cardId: string;
  /** Error timestamp */
  timestamp: number;
  /** Original error cause */
  cause?: unknown;
}

/**
 * Payment provider callback functions
 */
export interface PaymentCallbacks {
  /** Called when payment transaction is initiated */
  onPaymentStarted: (paymentData: PaymentData) => void;
  /** Called when payment is completed successfully */
  onPaymentCompleted: (details: PaymentDetails) => void;
  /** Called when payment fails */
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
  /** Pool to join */
  pool: PaymentPool;
  /** Existing pending card to activate */
  card: PoolCard;
  /** Payment provider preference */
  provider?: "daimo" | "rainbow" | "auto";
  /** Payment callbacks */
  callbacks: PaymentCallbacks;
}

/**
 * Payment button props for provider-specific buttons
 */
export interface PaymentButtonProps {
  /** Pool being joined */
  pool: PaymentPool;
  /** Card being activated */
  card: PoolCard;
  /** Function to generate payment data */
  getPaymentData: () => PaymentData;
  /** Payment event callbacks */
  callbacks: {
    handlePaymentStarted: (paymentData: PaymentData) => void;
    handlePaymentCompleted: (
      event: DaimoPaymentEvent | RainbowTransactionEvent,
    ) => void;
    handlePaymentError: (error: DaimoError | WagmiError) => void;
  };
}
