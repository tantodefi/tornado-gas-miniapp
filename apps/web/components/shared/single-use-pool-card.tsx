//file: prepaid-gas-website/apps/web/components/shared/single-use-pool-card.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Pool } from "@/types/pool";
import { formatJoiningFee, formatMembersCount } from "@/utils";

const SingleUsePoolCard: React.FC<{
  pool?: Pool;
  onCardClick?: (paymasterAddress: string) => void;
}> = ({ pool, onCardClick }) => {
  const handleCardClick = () => {
    if (pool && onCardClick) {
      onCardClick(pool.address);
    }
  };
  const isDummy = !pool;
  const accountNumber = isDummy
    ? `**** **** **** 4337`
    : `**** **** **** ${'4337'.padStart(4, "0")}`;
  const network = isDummy ? "ETHEREUM" : pool.network.toUpperCase();
  const joiningFee = isDummy ? "0.0001" : formatJoiningFee(pool.joiningAmount);
  const memberCount = isDummy ? "423" : formatMembersCount(pool.treeSize);

  return (
    <motion.div
      className="cursor-pointer mx-auto w-fit"
      whileHover={{
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(236, 72, 153, 0.3)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={handleCardClick}
    >
      <motion.div
        className="relative w-[280px] h-[180px] sm:w-[320px] sm:h-[200px]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
      >
        {/* Main card with gradient */}
        <motion.div
          className="w-full h-full bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl border border-pink-500/30 relative shadow-2xl overflow-hidden"
          animate={{
            rotateY: [0, -2, 0, 2, 0],
            rotateX: [0, -1, 0, 1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
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
              delay: 1.5,
            }}
          />
          {/* Watermark diagonal pattern */}
          <div
            className="absolute inset-0 pointer-events-none select-none opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Perforated edges */}
          <div className="absolute left-0 top-0 bottom-0 w-3 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-slate-900 rounded-full"
                style={{
                  left: "-4px",
                  top: `${8 + i * 14}px`,
                }}
              />
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-3 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-slate-900 rounded-full"
                style={{
                  right: "-4px",
                  top: `${8 + i * 14}px`,
                }}
              />
            ))}
          </div>

          <div className="p-5 h-full flex flex-col justify-between text-white relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-pink-200">
                    ONE-TIME
                  </span>
                </div>
                <div className="text-xs text-pink-300">GAS VOUCHER</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-lg font-bold text-white">
                  {joiningFee} ETH
                </div>
                <div className="text-xs text-pink-300">
                  {memberCount} members
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end mt-auto">
              <div className="font-mono text-xs text-pink-400">
                {accountNumber}
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-pink-300">{network}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SingleUsePoolCard;
