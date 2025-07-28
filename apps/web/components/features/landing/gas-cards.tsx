// Gas Credit Card Components for Landing Page
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Shield, Zap, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import MultiUsePoolCard from "../../shared/multi-use-pool-card";
import SingleUsePoolCard from "../../shared/single-use-pool-card";
import CacheEnabledPoolCard from "../../shared/cache-enabled-pool-card";

// Card data structure
interface CardData {
  id: number;
  component: React.ComponentType;
  title: string;
  description: string;
  features: Array<{ icon: React.ComponentType<{ className?: string }>; label: string }>;
}

const cardData: CardData[] = [
  {
    id: 1,
    component: MultiUsePoolCard,
    title: "Multi-Use Credits",
    description: "Like a gift card - buy credits once, use for multiple transactions until your balance runs out.",
    features: [
      { icon: Zap, label: "Multiple Use" },
      { icon: Shield, label: "Good Privacy" }
    ]
  },
  {
    id: 2,
    component: CacheEnabledPoolCard,
    title: "Cache-Enabled Credits",
    description: "Optimized multi-use credits with caching for frequent users. Lower gas costs for repeat transactions.",
    features: [
      { icon: Zap, label: "Optimized" },
      { icon: Shield, label: "Lower Costs" }
    ]
  },
  {
    id: 3,
    component: SingleUsePoolCard,
    title: "One-Time Vouchers",
    description: "Like a disposable ticket - use once and discard. Each transaction uses a fresh identity for maximum privacy.",
    features: [
      { icon: CreditCard, label: "Single Use" },
      { icon: Clock, label: "Max Privacy" }
    ]
  }
];

// Enhanced Cards Carousel for Landing Page
export const GasCardsShowcase: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cardData.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % cardData.length);
    setIsAutoPlaying(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + cardData.length) % cardData.length);
    setIsAutoPlaying(false);
  };

  const goToCard = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentCard = cardData[currentIndex];
  const CardComponent = currentCard!.component;

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="text-center mb-12 sm:mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="heading-prepaid-section mb-4 text-prepaid-gradient-white">
          Three Types of Gas Credits
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto">
          Choose between multi-use, cache-enabled, or one-time credits based on your privacy and performance needs
        </p>
      </motion.div>

      {/* Carousel Container */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Card Display */}
          <div className="text-center mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex justify-center"
              >
                <CardComponent />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card Information */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center space-y-4"
            >
              <h3 className="text-2xl font-bold text-white">{currentCard!.title}</h3>
              <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
                {currentCard!.description}
              </p>
              <div className="flex justify-center gap-6 text-sm text-slate-500">
                {currentCard!.features.map((feature, index) => (
                  <span key={index} className="flex items-center gap-2">
                    <feature.icon className="w-4 h-4" />
                    {feature.label}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={prevCard}
              className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              aria-label="Previous card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Indicators */}
            <div className="flex gap-2">
              {cardData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToCard(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex
                      ? "bg-purple-400"
                      : "bg-slate-600 hover:bg-slate-500"
                  }`}
                  aria-label={`Go to card ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextCard}
              className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              aria-label="Next card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
        </div>
      </div>
    </section>
  );
};

// Updated GasCard component (replace your existing one)
export const GasCard: React.FC = () => (
  <div className="mx-auto perspective-1000">
    <MultiUsePoolCard />
  </div>
);
