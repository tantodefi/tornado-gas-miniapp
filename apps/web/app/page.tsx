//file:prepaid-gas-website/apps/web/app/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  GasCard,
  GasCardsShowcase,
} from "@/components/features/landing/gas-cards";

// Types (keeping existing ones)
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  iconVariant: "blue" | "purple" | "pink";
}

interface ProcessStepProps {
  stepNumber: number;
  icon: string;
  title: string;
  description: string;
}

interface StatItemProps {
  number: string;
  label: string;
}

// All existing components stay the same (FloatingBackground, Header, GasCard, FeatureCard, ProcessStep, StatItem)
// ... (keeping all the existing component code exactly the same)

// Floating Background Component (unchanged)
const FloatingBackground: React.FC = () => {
  const positions = [
    { top: "20%", left: "10%", delay: 0 },
    { top: "60%", left: "80%", delay: 2 },
    { top: "30%", left: "70%", delay: 4 },
    { top: "80%", left: "20%", delay: 1 },
    { top: "10%", left: "60%", delay: 3 },
  ] as const;

  return (
    <div className="fixed inset-0 z-0 opacity-60 pointer-events-none">
      <div className="absolute inset-0">
        {positions.map((position, index) => (
          <motion.div
            key={index}
            className="floating-card-element floating-prepaid"
            style={{
              top: position.top,
              left: position.left,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
              opacity: [0.3, 0.4, 0.4],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: position.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Header Component (unchanged)
const Header: React.FC = () => (
  <header className="p-4 sm:p-6 lg:p-8 flex justify-between items-center relative z-10">
    <div className="font-semibold text-slate-200 font-mono text-sm sm:text-base">
      Prepaid Gas Credits
    </div>
    <div className="text-xs sm:text-sm text-slate-400 font-mono">v0.1</div>
  </header>
);

// GasCard Component (unchanged)
// const GasCard: React.FC = () => (
//   <div className="mx-auto perspective-1000">
//     <motion.div
//       className="w-[250px] h-[150px] sm:w-[280px] sm:h-[168px] lg:w-[320px] lg:h-[192px] mx-auto bg-gradient-to-br from-slate-800 to-slate-600 rounded-xl lg:rounded-2xl border border-purple-500/30 relative shadow-2xl"
//       animate={{
//         rotateY: [0, 5, 0, -5, 0],
//         rotateX: [0, 2, 0, -2, 0],
//       }}
//       transition={{
//         duration: 4,
//         repeat: Infinity,
//         ease: "easeInOut",
//       }}
//     >
//       <motion.div
//         className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl lg:rounded-2xl"
//         initial={{ x: "-100%" }}
//         animate={{ x: "100%" }}
//         transition={{
//           duration: 3,
//           repeat: Infinity,
//           ease: "easeInOut",
//         }}
//       />

//       <div className="p-4 sm:p-5 lg:p-6 h-full flex flex-col justify-between">
//         <div className="flex justify-between items-start">
//           <div className="flex flex-col items-start ">
//             <div className="text-xs sm:text-sm text-pink-500 font-bold">
//               PREPAID
//             </div>
//             <div className="text-xs text-slate-500">GAS CREDIT</div>
//           </div>

//           <div className="flex flex-col items-end">
//             <div className="text-md sm:text-lg lg:text-xl font-bold text-purple-500">
//               0.05 ETH
//             </div>
//             <div className="text-[10px] text-slate-500">847 members</div>
//           </div>
//         </div>
//         <div className="flex justify-between items-end">
//           <div className="font-mono text-[10px] sm:text-xs text-slate-500">
//             **** **** **** 4337
//           </div>
//           <div className="text-right">
//             <div className="text-xs text-slate-500">Ethereum</div>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   </div>
// );

// Feature Card Component (unchanged)
const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  iconVariant,
}) => {
  const iconClasses = {
    blue: "icon-prepaid-blue",
    purple: "icon-prepaid-purple",
    pink: "icon-prepaid-pink",
  };

  return (
    <motion.div
      className="card-prepaid-glass card-content-md card-hover-lift relative overflow-hidden"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`icon-prepaid icon-prepaid-md mb-4 lg:mb-6 ${iconClasses[iconVariant]}`}
      >
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-3 lg:mb-4 text-white">
        {title}
      </h3>
      <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
        {description}
      </p>
    </motion.div>
  );
};

// Process Step Component (unchanged)
const ProcessStep: React.FC<ProcessStepProps> = ({
  stepNumber,
  icon,
  title,
  description,
}) => (
  <motion.div
    className="process-step"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: stepNumber * 0.1 }}
  >
    <div className="process-step-number">{stepNumber}</div>
    <div className="text-2xl lg:text-3xl mb-3 lg:mb-4 text-purple-500">
      {icon}
    </div>
    <h3 className="text-lg sm:text-xl font-bold mb-3 lg:mb-4 text-white">
      {title}
    </h3>
    <p className="text-slate-400 text-sm sm:text-base">{description}</p>
  </motion.div>
);

// Stat Item Component (unchanged)
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

// Hero Section Component - UPDATED with Next.js Links
// const Hero: React.FC = () => (
//   <section className="section-prepaid text-center relative z-10">
//     <motion.div
//       className="badge-prepaid mb-6 sm:mb-8"
//       initial={{ opacity: 0, y: -20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       ✨ Prepaid Gas Credits • Unlinkable Spending
//     </motion.div>

//     <motion.h1
//       className="heading-prepaid-hero mb-4 sm:mb-6"
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.7, delay: 0.2 }}
//     >
//       <div className="text-prepaid-gradient-white">Prepaid Gas</div>
//       <div className="text-prepaid-gradient-brand">Credits</div>
//     </motion.h1>

//     <motion.p
//       className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-xl lg:max-w-2xl mx-auto mb-8 lg:mb-10 leading-relaxed px-4"
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.7, delay: 0.4 }}
//     >
//       Like prepaid mobile cards for blockchain gas. Buy credit anonymously,
//       spend without revealing which &quot;card&quot; you purchased. Built on{" "}
//       <span className="text-purple-400 font-semibold">ERC-4337 </span> with{" "}
//       <span className="text-purple-400 font-semibold">Semaphore Protocol</span>.
//     </motion.p>

//     <motion.div
//       className="flex-prepaid-responsive mb-8 sm:mb-12 px-4"
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.7, delay: 0.6 }}
//     >
//       <Link href="/pools">
//         <Button className="btn-prepaid-primary btn-lg">Launch App →</Button>
//       </Link>
//       <Button className="btn-prepaid-outline btn-lg">View Docs</Button>
//     </motion.div>

//     <motion.div
//       className="mt-8 sm:mt-12"
//       initial={{ opacity: 0, scale: 0.8 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.8, delay: 0.8 }}
//     >
//       <GasCard />
//     </motion.div>
//   </section>
// );
// Updated landing page content with simple, relatable language
// This replaces the existing PrepaidGasLanding component content

// Hero Section - Simple and Clear
// Hero Section
const Hero: React.FC = () => (
  <section className="section-prepaid text-center relative z-10">
    <motion.div
      className="badge-prepaid mb-6 sm:mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      ✨ Anonymous Gas Payments • ERC-4337 + Semaphore • Prepaid Privacy
    </motion.div>

    <motion.h1
      className="heading-prepaid-hero mb-4 sm:mb-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <div className="text-prepaid-gradient-white">Prepaid Gas</div>
      <div className="text-prepaid-gradient-brand">Credits</div>
    </motion.h1>

    <motion.p
      className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-xl lg:max-w-2xl mx-auto mb-8 lg:mb-10 leading-relaxed px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
    >
      Join a pool by paying upfront gas. Prove membership with zero-knowledge
      proofs using Semaphore. Spend credits anonymously through an ERC-4337
      paymaster — unlinkable and private by design.
    </motion.p>

    <motion.div
      className="flex-prepaid-responsive mb-8 sm:mb-12 px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.6 }}
    >
      <Link href="/pools">
        <Button className="btn-prepaid-primary btn-lg">
          Browse Gas Pools →
        </Button>
      </Link>
      <Button className="btn-prepaid-outline btn-lg">How It Works</Button>
    </motion.div>

    {/* <motion.div
      className="mt-8 sm:mt-12"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.8 }}
    >
      <GasCard />
    </motion.div> */}
  </section>
);

// Features Section
const Features: React.FC = () => {
  const features = [
    {
      icon: "💳",
      title: "Prepaid, Upfront Credit",
      description:
        "Pay once to join a pool — your deposit becomes prepaid gas, like topping up a transit pass. This gas is used to sponsor your future transactions.",
      iconVariant: "blue" as const,
    },
    {
      icon: "⚡",
      title: "Reusable or One-Time Credits",
      description:
        "Choose ‘GasLimited’ credits for multiple uses within a gas limit, or ‘OneTimeUse’ vouchers for single, unlinkable transactions. Flexibility with privacy trade-offs.",
      iconVariant: "purple" as const,
    },
    {
      icon: "🔒",
      title: "Private, Unlinkable Spending",
      description:
        "Spend via zero-knowledge proofs. The paymaster verifies you're a pool member without revealing who you are. No link between credit and identity.",
      iconVariant: "pink" as const,
    },
  ];

  return (
    <section className="section-prepaid">
      <motion.div
        className="text-center mb-8 sm:mb-12 lg:mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="heading-prepaid-section mb-3 sm:mb-4 text-prepaid-gradient-white">
          How Prepaid Gas Credits Work
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-xl lg:max-w-2xl mx-auto px-4">
          Think prepaid SIMs — buy upfront, spend anonymously. But for gas on
          Ethereum.
        </p>
      </motion.div>

      <div className="grid-prepaid-features">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  );
};

// Process Section Component (unchanged)
// Process Section
const Process: React.FC = () => {
  const steps = [
    {
      stepNumber: 1,
      icon: "💸",
      title: "Join a Gas Pool",
      description:
        "Pay a gas deposit (gas limit) to join a pool. This becomes your prepaid credit for future transactions.",
    },
    {
      stepNumber: 2,
      icon: "🕵️‍♂️",
      title: "Prove Membership Anonymously",
      description:
        "You receive a Semaphore-based identity to prove you're part of the pool — without revealing who you are.",
    },
    {
      stepNumber: 3,
      icon: "🚀",
      title: "Send Private Transactions",
      description:
        "Use ERC-4337 to submit transactions. The paymaster verifies your proof and pays gas — no link to your wallet.",
    },
  ];

  return (
    <section className="section-prepaid">
      <motion.div
        className="text-center mb-8 sm:mb-12 lg:mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="heading-prepaid-section text-prepaid-gradient-white px-4">
          Step-by-Step Flow
        </h2>
      </motion.div>

      <div className="grid-prepaid-process">
        {steps.map((step) => (
          <ProcessStep key={step.stepNumber} {...step} />
        ))}
      </div>
    </section>
  );
};

// Stats Section Component (unchanged)
// Stats Section
const Stats: React.FC = () => {
  const stats = [
    { number: "847", label: "Gas Credit Users" },
    { number: "23.8", label: "ETH Deposited Across Pools" },
    { number: "3,421", label: "Anonymous Transactions" },
    { number: "12", label: "Available Pools" },
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

// CTA Section Component - UPDATED with Next.js Link
// CTA Section
const CTA: React.FC = () => (
  <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-t border-purple-500/20">
    <motion.div
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="heading-prepaid-section mb-4 sm:mb-6 text-prepaid-gradient-white">
        Ready to Join a Gas Pool?
      </h2>
      <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-8 sm:mb-10 px-4 leading-relaxed">
        Pay upfront once, then spend anonymously. Secure, reusable gas credits
        with zero-knowledge membership proofs.
      </p>
      <Link href="/pools">
        <Button className="btn-prepaid-primary btn-lg">Launch App →</Button>
      </Link>
      <div className="text-xs sm:text-sm text-slate-400 font-mono mt-4 sm:mt-6 px-4">
        Built with ERC-4337 • Powered by Semaphore • Privacy by Default
      </div>
    </motion.div>
  </section>
);

// Main Page Component - UPDATED to use Next.js routing
const PrepaidGasLanding: React.FC = () => (
  <div className="min-h-screen bg-prepaid-gradient text-white overflow-x-hidden">
    <FloatingBackground />
    <Header />
    <Hero />
    <GasCardsShowcase />
    <Features />
    <Process />
    <Stats />
    <CTA />
  </div>
);

export default PrepaidGasLanding;
