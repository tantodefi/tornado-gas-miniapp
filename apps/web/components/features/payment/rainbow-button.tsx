//file:prepaid-gas-website/apps/web/components/features/payment/rainbow-button.tsx

"use client";

import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useEffect, useState } from "react";
import { formatJoiningFee } from "./payment-manager";
import type {
  PaymentData,
  PaymentButtonProps,
  RainbowTransactionEvent,
  WagmiError,
} from "@/types";

/**
 * RainbowButton component for traditional wallet connections
 * Adapted for current pool/card system
 */
export function RainbowButton({
  pool,
  card,
  getPaymentData,
  callbacks,
}: PaymentButtonProps) {
  const { address, isConnected } = useAccount();
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "pending"
  >("idle");
  const [currentPaymentData, setCurrentPaymentData] =
    useState<PaymentData | null>(null);

  const {
    sendTransaction,
    data: hash,
    error: sendError,
    isPending: isSendPending,
  } = useSendTransaction();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Watch for transaction state changes
  useEffect(() => {
    if (isSendPending) {
      setTransactionStatus("pending");
    }

    if (sendError) {
      setTransactionStatus("idle");
      const error: WagmiError = {
        name: sendError.name,
        message: sendError.message,
        cause: sendError.cause,
      };
      callbacks.handlePaymentError(error);
      return;
    }

    if (isConfirmed && hash && currentPaymentData) {
      setTransactionStatus("idle");
      // Pass transaction hash to completion callback
      const event: RainbowTransactionEvent = {
        hash,
        transactionHash: hash,
        success: true,
        blockNumber: receipt?.blockNumber
          ? Number(receipt.blockNumber)
          : undefined,
        gasUsed: receipt?.gasUsed?.toString(),
      };
      callbacks.handlePaymentCompleted(event);
    }

    if (receiptError) {
      setTransactionStatus("idle");
      const error: WagmiError = {
        name: receiptError.name,
        message: receiptError.message,
        cause: receiptError.cause,
      };
      callbacks.handlePaymentError(error);
    }
  }, [
    isSendPending,
    isConfirming,
    isConfirmed,
    sendError,
    receiptError,
    hash,
    callbacks,
    currentPaymentData,
    receipt?.blockNumber,
    receipt?.gasUsed,
  ]);

  const handlePurchase = async () => {
    if (!isConnected || !address) return;

    try {
      setTransactionStatus("pending");

      // Generate payment data when purchase is initiated
      const paymentData = getPaymentData();
      setCurrentPaymentData(paymentData);

      // Call payment started callback with payment data
      callbacks.handlePaymentStarted(paymentData);

      sendTransaction({
        to: pool.paymaster.address as `0x${string}`,
        data: paymentData.calldata,
        value: BigInt(pool.joiningFee),
      });
    } catch (error) {
      setTransactionStatus("idle");
      const wagmiError: WagmiError = {
        name: error instanceof Error ? error.name : "UnknownError",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        cause: error,
      };
      callbacks.handlePaymentError(wagmiError);
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <ConnectButton />
        <div className="text-center">
          <p className="text-xs text-slate-400">
            Connect your wallet to continue
          </p>
          <p className="text-xs text-slate-500 mt-1">
            MetaMask, WalletConnect, and more
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.button
        onClick={handlePurchase}
        className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 ${
          transactionStatus === "idle"
            ? "btn-prepaid-primary btn-lg w-full"
            : "bg-yellow-500 hover:bg-yellow-600 text-white cursor-not-allowed"
        }`}
        whileHover={transactionStatus === "idle" ? { scale: 1.02 } : {}}
        whileTap={transactionStatus === "idle" ? { scale: 0.98 } : {}}
        disabled={transactionStatus !== "idle"}
      >
        {transactionStatus === "idle" &&
          `Pay ${formatJoiningFee(pool.joiningFee)} ETH`}
        {transactionStatus === "pending" && "Confirm in Wallet..."}
      </motion.button>

      <div className="text-center">
        <p className="text-xs text-slate-400">
          Powered by{" "}
          <span className="font-medium text-purple-400">Rainbow Kit</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Connect any Ethereum wallet
        </p>

        {/* Show current payment info for debugging */}
        {currentPaymentData && (
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Card: {currentPaymentData.cardId} • Pool:{" "}
            {currentPaymentData.poolId}
          </p>
        )}
      </div>
    </div>
  );
}
