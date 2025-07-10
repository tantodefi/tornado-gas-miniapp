//file:prepaid-gas-website/apps/web/components/features/landing/stats.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatItemProps {
  number: string;
  label: string;
}

// Stat Item Component
const StatItem: React.FC<StatItemProps> = ({ number, label }) => (
  <motion.div
    className="stat-prepaid"
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="stat-prepaid-number">{number}</div>
    <div className="stat-prepaid-label">{label}</div>
  </motion.div>
);

// Stats Section

const Stats: React.FC = () => {
  const stats = [
    { number: "0", label: "Gas Credit Users" },
    { number: "0", label: "ETH Deposited Across Pools" },
    { number: "0", label: "Anonymous Transactions" },
    { number: "0", label: "Available Pools" },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30 border-t border-b border-slate-600/30 backdrop-blur-sm">
      <div className="grid-prepaid-stats max-w-7xl mx-auto text-center">
        {stats.map((stat, index) => (
          <StatItem key={index} {...stat} />
        ))}
      </div>
    </section>
  );
};

export default Stats;
