// apps/web/components/payment/index.ts

// Main payment components
export {
  PaymentManager,
  usePaymentDataGenerator,
  formatJoiningFee,
} from "./PaymentManager";
export { DaimoButton } from "./DaimoButton";
export { RainbowButton } from "./RainbowButton";

// Payment types
export type {
  PaymentPool,
  PaymentData,
  PaymentDetails,
  PaymentError,
  PaymentCallbacks,
  PaymentManagerConfig,
  PaymentButtonProps,
  DaimoPaymentEvent,
  RainbowTransactionEvent,
  WagmiError,
  DaimoError,
} from "./types";

// Payment hook
export { usePayment, usePaymentStateText } from "../../hooks/use-payment";

// Re-export for convenience
export type { PoolCard } from "@/lib/storage/indexed-db-storage";
