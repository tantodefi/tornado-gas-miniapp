//file:prepaid-gas-website/apps/web/components/features/payment/rainbow-button.tsx

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Button } from "@workspace/ui/components/button";
import { formatJoiningFee } from "@/utils";
import { PoolCard } from "@/lib/storage/indexed-db";
import { Pool } from "@/types/pool";
import { PaymentData } from "./payment-manager";

interface RainbowButtonProps {
  pool: Pool;
  card: PoolCard;
  getPaymentData: () => PaymentData;
  onPaymentStarted: () => void;
  onPaymentSuccess: (transactionHash: string) => void;
  onPaymentError: (error: string) => void;
}

/**
 * Rainbow wallet payment button
 */
function RainbowButton({
  pool,
  getPaymentData,
  onPaymentStarted,
  onPaymentSuccess,
  onPaymentError,
}: RainbowButtonProps) {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [isProcessing, setIsProcessing] = useState(false);

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
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction state changes
  useEffect(() => {
    // Payment started when wallet confirmation appears
    if (isSendPending && !isProcessing) {
      setIsProcessing(true);
      onPaymentStarted();
    }

    // Handle send errors
    if (sendError) {
      setIsProcessing(false);

      // Check for user rejection
      const isUserRejection =
        sendError.message?.toLowerCase().includes("user rejected") ||
        sendError.message?.toLowerCase().includes("user denied") ||
        sendError.name?.includes("UserRejectedRequestError") ||
        (sendError as unknown as { code?: number }).code === 4001;

      if (isUserRejection) {
        onPaymentError(
          "Payment cancelled - you rejected the transaction in your wallet",
        );
      } else if (
        sendError.message?.toLowerCase().includes("insufficient funds")
      ) {
        onPaymentError("Insufficient funds to complete the transaction");
      } else {
        onPaymentError(sendError.message || "Transaction failed");
      }
    }

    // Handle success
    if (isConfirmed && hash) {
      setIsProcessing(false);
      onPaymentSuccess(hash);
    }

    // Handle receipt errors
    if (receiptError) {
      setIsProcessing(false);
      onPaymentError(receiptError.message || "Transaction confirmation failed");
    }
  }, [
    isSendPending,
    isConfirmed,
    sendError,
    receiptError,
    hash,
    isProcessing,
    onPaymentStarted,
    onPaymentSuccess,
    onPaymentError,
  ]);

  const handlePayment = async () => {
    if (!isConnected || !address) return;

    try {
      const paymentData = getPaymentData();

      sendTransaction({
        to: pool.paymaster.address as `0x${string}`,
        data: paymentData.calldata,
        value: BigInt(pool.joiningFee),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      onPaymentError(errorMessage);
    }
  };

  // Show connect button if not connected
  if (!isConnected) {
    return (
      <div className="space-y-4">
        <Button
          className="btn-prepaid-primary btn-md w-full"
          onClick={openConnectModal}
        >
          Connect Wallet
        </Button>
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

  // Payment button
  return (
    <div className="space-y-4">
      <motion.button
        onClick={handlePayment}
        className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 ${
          isProcessing || isConfirming
            ? "bg-yellow-500 hover:bg-yellow-600 text-white cursor-not-allowed"
            : "btn-prepaid-primary btn-lg"
        }`}
        whileHover={!isProcessing ? { scale: 1.02 } : {}}
        whileTap={!isProcessing ? { scale: 0.98 } : {}}
        disabled={isProcessing || isConfirming}
      >
        {isProcessing && !isConfirming && "Confirm in Wallet..."}
        {isConfirming && "Confirming Transaction..."}
        {!isProcessing &&
          !isConfirming &&
          `Pay ${formatJoiningFee(pool.joiningFee)} ETH`}
      </motion.button>

      <div className="text-center">
        <p className="text-xs text-slate-400">
          Powered by{" "}
          <span className="font-medium text-purple-400">Rainbow Kit</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Connect any Ethereum wallet
        </p>
      </div>
    </div>
  );
}

export { RainbowButton };
