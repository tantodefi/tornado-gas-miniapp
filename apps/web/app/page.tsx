//file:prepaid-gas-website/apps/web/app/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { GasCardsShowcase } from "@/components/features/landing/gas-cards";
import Stats from "@/components/features/landing/stats";
import { AppHeader } from "@/components/layout/app-header";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  iconVariant: "blue" | "purple" | "pink";
}

// Floating Background Component
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

// Feature Card Component
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

// Hero Section
const Hero: React.FC = () => {
  
  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
      });
    }
  };
  return (
  <section className="section-prepaid text-center relative z-10">
    <motion.div
      className="badge-prepaid mb-6 sm:mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      ✨ Anonymous Gas Payments • ERC-4337 + Semaphore Protocol
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
      Join a pool by paying upfront gas. Prove pool membership with zero-knowledge
      proofs to spend gas credits anonymously through an ERC-4337 + Semaphore powered
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
      <Button className="btn-prepaid-outline btn-lg" onClick={scrollToHowItWorks} >How It Works</Button>
    </motion.div>
  </section>
)};

// Features Section
const Features: React.FC = () => {
  const features = [
    {
      icon: "💳",
      title: "Prepaid, Upfront Credit",
      description:
        "Pay once to join a pool — your deposit becomes prepaid gas. This gas is used to sponsor your future transactions.",
      iconVariant: "blue" as const,
    },
    {
      icon: "⚡",
      title: "Reusable or One-Time Credits",
      description:
        "Choose ‘MultiUse’ credits for multiple uses within a limit, or ‘OneTimeUse’ vouchers for single, unlinkable transactions. Flexibility with privacy trade-offs.",
      iconVariant: "purple" as const,
    },
    {
      icon: "🔒",
      title: "Private, Unlinkable Spending",
      description:
        "Spend via zero-knowledge proofs. The paymaster verifies you're a pool member without revealing who you are. No link between credit buyer and spender identity.",
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
          How Prepaid Gas Work
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-xl lg:max-w-2xl mx-auto px-4">
          Think gift card — pay upfront, spend anonymously. But for gas on
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

// Main Page Component
const LandingPage: React.FC = () => (
  <div className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-prepaid-gradient text-white">
    <FloatingBackground />
    <AppHeader />

    {/* Hero */}
    <section className="min-h-screen snap-start flex flex-col justify-center">
      <Hero />
    </section>

    {/* Cards Showcase */}
    <section className="min-h-screen snap-start flex flex-col justify-center">
      <GasCardsShowcase />
    </section>

    {/* Features */}
    <section id="how-it-works" className="min-h-screen snap-start flex flex-col justify-center">
      <Features  />
      <Stats />
      <CTA />
    </section>
  </div>
);

export default LandingPage;
