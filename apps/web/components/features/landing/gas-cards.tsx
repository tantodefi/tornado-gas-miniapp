// Gas Credit Card Components for Landing Page
"use client";

import React from "react";
import { motion } from "framer-motion";
import { CreditCard, Shield, Zap, Clock } from "lucide-react";
import MultiUsePoolCard from "../../shared/multi-use-pool-card";
import SingleUsePoolCard from "../../shared/single-use-pool-card";

// Enhanced Cards Section for Landing Page
export const GasCardsShowcase: React.FC = () => (
  <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
    <motion.div
      className="text-center mb-12 sm:mb-16"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="heading-prepaid-section mb-4 text-prepaid-gradient-white">
        Two Types of Gas Credits
      </h2>
      <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto">
        Choose between multiuse credits for convenience or one-time vouchers for
        maximum privacy
      </p>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
      {/* GasLimited Card */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <MultiUsePoolCard />
        <div className="mt-6 space-y-3">
          <h3 className="text-xl font-bold text-white">Multiuse Credits</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Like a rechargeable transit card - buy credits once, use for
            multiple transactions until your balance runs out.
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Multiple Use
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Good Privacy
            </span>
          </div>
        </div>
      </motion.div>

      {/* OneTimeUse Card */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <SingleUsePoolCard />
        <div className="mt-6 space-y-3">
          <h3 className="text-xl font-bold text-white">One-Time Vouchers</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Like a disposable ticket - use once and discard. Each transaction
            uses a fresh identity for maximum privacy.
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              Single Use
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Max Privacy
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

// Updated GasCard component (replace your existing one)
export const GasCard: React.FC = () => (
  <div className="mx-auto perspective-1000">
    <MultiUsePoolCard />
  </div>
);
