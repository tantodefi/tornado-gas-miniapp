"use client";

import { motion } from "framer-motion";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useEffect, useState } from "react";
import type {
  PaymentData,
  PaymentButtonProps,
  RainbowTransactionEvent,
  WagmiError,
} from "@/types";
import { formatJoiningFee } from "@/utils";
import { Button } from "@workspace/ui/components/button";

/**
 * RainbowButton component for traditional wallet connections
 * Adapted for current pool/card system
 */
export function RainbowButton({
  pool,
  getPaymentData,
  callbacks,
}: PaymentButtonProps) {
  const { address, isConnected } = useAccount();
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "pending"
  >("idle");
  const [currentPaymentData, setCurrentPaymentData] =
    useState<PaymentData | null>(null);
  const { openConnectModal, connectModalOpen } = useConnectModal();

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
    // 🔧 FIX: Call onPaymentStarted when wallet confirmation dialog appears
    if (isSendPending && currentPaymentData) {
      console.log(
        "🔐 Wallet confirmation dialog appeared - calling onPaymentStarted",
      );
      setTransactionStatus("pending");

      // NOW call payment started callback - this will disable cancel button at the right time
      callbacks.handlePaymentStarted(currentPaymentData);
    }

    if (sendError) {
      console.log("❌ Send transaction error:", sendError);
      setTransactionStatus("idle");

      // 🔧 ENHANCED: Comprehensive wallet rejection handling
      const error: WagmiError = {
        name: sendError.name,
        message: sendError.message,
        cause: sendError.cause,
      };

      // 🔧 IMPROVED: More comprehensive rejection detection
      const isUserRejection =
        sendError.message?.toLowerCase().includes("user rejected") ||
        sendError.message?.toLowerCase().includes("user denied") ||
        sendError.message?.toLowerCase().includes("rejected by user") ||
        sendError.message?.toLowerCase().includes("transaction was rejected") ||
        sendError.message?.toLowerCase().includes("user cancelled") ||
        sendError.name?.includes("UserRejectedRequestError") ||
        sendError.cause?.toString().includes("4001") || // MetaMask rejection code
        sendError.cause?.toString().includes("ACTION_REJECTED") ||
        (sendError as any)?.code === 4001 ||
        (sendError as any)?.code === "ACTION_REJECTED";

      if (isUserRejection) {
        console.log("🚫 User rejected transaction in wallet");
        error.message =
          "Payment cancelled - you rejected the transaction in your wallet";
      } else if (
        sendError.message?.toLowerCase().includes("insufficient funds")
      ) {
        console.log("💰 Insufficient funds error");
        error.message = "Insufficient funds to complete the transaction";
      } else if (sendError.message?.toLowerCase().includes("network")) {
        console.log("🌐 Network error");
        error.message =
          "Network error occurred. Please check your connection and try again";
      } else if (sendError.message?.toLowerCase().includes("nonce")) {
        console.log("🔢 Nonce error");
        error.message = "Transaction conflict detected. Please try again";
      } else {
        console.log("❌ Other wallet error:", sendError.message);
        // Keep original message for other errors
      }

      callbacks.handlePaymentError(error);

      // Clear payment data on error
      setCurrentPaymentData(null);
      return;
    }

    if (isConfirmed && hash && currentPaymentData) {
      console.log("✅ Transaction confirmed:", hash);
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

      // Clear payment data after success
      setCurrentPaymentData(null);
    }

    if (receiptError) {
      console.log("❌ Receipt error:", receiptError);
      setTransactionStatus("idle");

      const error: WagmiError = {
        name: receiptError.name,
        message: receiptError.message,
        cause: receiptError.cause,
      };
      callbacks.handlePaymentError(error);

      // Clear payment data on error
      setCurrentPaymentData(null);
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
      console.log("🚀 Starting payment process...");

      // Generate payment data when purchase is initiated
      const paymentData = getPaymentData();
      setCurrentPaymentData(paymentData);

      console.log("💳 Payment data generated:", {
        poolId: paymentData.poolId,
        cardId: paymentData.cardId,
      });

      // 🔧 REMOVED: Don't call handlePaymentStarted here - too early!
      // It will be called in useEffect when isSendPending becomes true

      sendTransaction({
        to: pool.paymaster.address as `0x${string}`,
        data: paymentData.calldata,
        value: BigInt(pool.joiningFee),
      });

      console.log("📨 Transaction sent to wallet for confirmation");
    } catch (error) {
      console.log("❌ Error in handlePurchase:", error);
      setTransactionStatus("idle");

      const wagmiError: WagmiError = {
        name: error instanceof Error ? error.name : "UnknownError",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        cause: error,
      };
      callbacks.handlePaymentError(wagmiError);

      // Clear payment data on error
      setCurrentPaymentData(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <Button
            className="btn-prepaid-primary btn-md my-3 "
            onClick={openConnectModal}
          >
            Connect Wallet
          </Button>
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
