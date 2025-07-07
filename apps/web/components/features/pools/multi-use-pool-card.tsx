//file: prepaid-gas-website/apps/web/components/features/pools/multi-use-pool-card.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Pool } from "@/types";
import { formatJoiningFee, formatMembersCount } from "@/utils";

const MultiUsePoolCard: React.FC<{
  pool?: Pool;
  onCardClick?: (poolId: string) => void;
}> = ({ pool, onCardClick }) => {
  const handleCardClick = () => {
    if (pool && onCardClick) {
      onCardClick(pool.poolId);
    }
  };
  const isDummy = !pool;
  const accountNumber = isDummy
    ? `**** **** **** 4337`
    : `**** **** **** ${pool.poolId.slice(-4).padStart(4, "0")}`;
  const network = isDummy ? "ETHEREUM" : pool.network.toUpperCase();
  const joiningFee = isDummy ? "0.001" : formatJoiningFee(pool.joiningFee);
  const memberCount = isDummy ? "847" : formatMembersCount(pool.memberCount);

  return (
    <motion.div
      className="cursor-pointer mx-auto w-fit"
      whileHover={{
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.3)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={handleCardClick}
    >
      <motion.div
        className="relative w-[280px] h-[180px] sm:w-[320px] sm:h-[200px]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <motion.div
          className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl relative overflow-hidden"
          animate={{
            rotateY: [0, 2, 0, -2, 0],
            rotateX: [0, 1, 0, -1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Watermark diagonal pattern */}
          <div
            className="absolute inset-0 pointer-events-none select-none opacity-5"
            style={{
              backgroundImage: `repeating-linear-gradient(135deg, transparent 0 30px, #fff 30px 32px, transparent 32px 60px)`,
              backgroundSize: "60px 60px",
            }}
          />
          {/* Left and right notch masks */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full z-10 bg-black" />
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full z-10 bg-black" />

          <div className="p-4 sm:p-5 lg:p-6 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-start ">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-purple-200">
                    MULTI-USE
                  </span>
                </div>
                <div className="text-xs text-purple-300">GAS CREDITS</div>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-lg font-bold text-white">
                  {joiningFee} ETH
                </div>
                <div className="text-xs text-purple-300">
                  {memberCount} members
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end mt-auto">
              <div className="font-mono text-xs text-purple-400">
                {accountNumber}
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-purple-300">
                  {network}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MultiUsePoolCard;
