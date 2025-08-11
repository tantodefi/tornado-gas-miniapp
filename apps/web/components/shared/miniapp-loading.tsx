//file:tornado-gas-miniapp/apps/web/components/shared/miniapp-loading.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

interface MiniAppLoadingProps {
  message?: string;
}

/**
 * Loading component for Mini App initialization
 */
export const MiniAppLoading: React.FC<MiniAppLoadingProps> = ({
  message = "Connecting to Farcaster...",
}) => {
  return (
    <div className="min-h-screen bg-prepaid-gradient flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="text-6xl mb-6"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          🌪️
        </motion.div>

        <motion.h2
          className="text-2xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Tornado Gas
        </motion.h2>

        <motion.p
          className="text-slate-400 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {message}
        </motion.p>

        <motion.div
          className="flex justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-400 rounded-full"
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
