"use client";

import React from "react";
import { motion } from "framer-motion";

interface CardPrintingAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

/**
 * Card printing animation component
 * Single responsibility: Show card printing animation with realistic timing
 * Reusable animation that can be used in other card-related flows
 */
const CardPrintingAnimation: React.FC<CardPrintingAnimationProps> = ({
  isVisible,
  onComplete,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        {/* Card printer machine */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Printer body */}
          <div className="w-64 h-32 bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg border border-slate-600 relative overflow-hidden">
            {/* Printer screen */}
            <div className="absolute top-4 left-4 w-16 h-8 bg-green-400 rounded border border-green-500">
              <motion.div
                className="w-full h-full bg-green-300 rounded"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>

            {/* Printer buttons */}
            <div className="absolute top-4 right-4 flex gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>

            {/* Card slot */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-slate-900 rounded-t border-l border-r border-t border-slate-600">
              {/* Card being printed */}
              <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-28 h-16 bg-gradient-to-br from-slate-800 to-slate-600 rounded border border-purple-500/30"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: -10, opacity: 1 }}
                transition={{ duration: 2, delay: 1 }}
                onAnimationComplete={() => {
                  setTimeout(onComplete, 1000);
                }}
              >
                {/* Card details being "printed" */}
                <div className="p-2 h-full flex flex-col justify-between text-xs">
                  <motion.div
                    className="text-pink-500 font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                  >
                    PREPAID
                  </motion.div>
                  <motion.div
                    className="text-purple-500 font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 0.5 }}
                  >
                    NEW CARD
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Printer activity lights */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              animate={{
                boxShadow: [
                  "0 0 0 rgba(139, 69, 19, 0)",
                  "0 0 20px rgba(139, 69, 19, 0.5)",
                  "0 0 0 rgba(139, 69, 19, 0)",
                ],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Status text */}
        <motion.div
          className="text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-bold mb-2 text-purple-400">
            Issuing Your Card
          </h3>
          <motion.p
            className="text-slate-300"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Creating secure prepaid gas card...
          </motion.p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-purple-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CardPrintingAnimation;
