'use client' 

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@workspace/ui/components/button'

// Types
interface FeatureCardProps {
  icon: string
  title: string
  description: string
  iconGradient: string
}

interface ProcessStepProps {
  stepNumber: number
  icon: string
  title: string
  description: string
}

interface StatItemProps {
  number: string
  label: string
}

// Floating Background Component
const FloatingBackground: React.FC = () => {
  const positions = [
    { top: '20%', left: '10%', delay: 0 },
    { top: '60%', left: '80%', delay: 2 },
    { top: '30%', left: '70%', delay: 4 },
    { top: '80%', left: '20%', delay: 1 },
    { top: '10%', left: '60%', delay: 3 }
  ] as const

  return (
    <div className="fixed inset-0 z-0 opacity-60 pointer-events-none">
      <div className="absolute inset-0">
        {positions.map((position, index) => (
          <motion.div
            key={index}
            className="absolute w-8 h-5 sm:w-12 sm:h-7 lg:w-[60px] lg:h-[35px] bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-md border border-purple-500/50"
            style={{
              top: position.top,
              left: position.left,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
              opacity: [0.3, 0.4, 0.4]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: position.delay
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Header Component
const Header: React.FC = () => (
  <header className="p-4 sm:p-6 lg:p-8 flex justify-between items-center relative z-10">
    <div className="font-semibold text-slate-200 font-mono text-sm sm:text-base">
      Prepaid Gas Credits
    </div>
    <div className="text-xs sm:text-sm text-slate-400 font-mono">v0.1</div>
  </header>
)

// Gas Card Component
const GasCard: React.FC = () => (
  <div className="mx-auto perspective-1000">
    <motion.div
      className="w-[250px] h-[150px] sm:w-[280px] sm:h-[168px] lg:w-[320px] lg:h-[192px] mx-auto bg-gradient-to-br from-slate-800 to-slate-600 rounded-xl lg:rounded-2xl border border-purple-500/30 relative shadow-2xl"
      animate={{
        rotateY: [0, 5, 0, -5, 0],
        rotateX: [0, 2, 0, -2, 0]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Card shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl lg:rounded-2xl"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="p-4 sm:p-5 lg:p-6 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="text-xs sm:text-sm text-slate-400 font-medium">GAS CREDIT</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-500">0.5 ETH</div>
        </div>
        <div className="flex justify-between items-end">
          <div className="font-mono text-[10px] sm:text-xs text-slate-500">**** **** **** 4337</div>
          <div className="text-[10px] sm:text-xs text-pink-500 font-bold">PREPAID</div>
        </div>
      </div>
    </motion.div>
  </div>
)

// Feature Card Component
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, iconGradient }) => (
  <motion.div
    className="bg-slate-800/40 border border-slate-600/50 rounded-2xl lg:rounded-3xl p-6 lg:p-8 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60 hover:border-purple-500/50 relative overflow-hidden"
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-15 lg:h-15 rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 lg:mb-6 text-xl sm:text-2xl ${iconGradient}`}>
      {icon}
    </div>
    <h3 className="text-lg sm:text-xl font-bold mb-3 lg:mb-4 text-white">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm sm:text-base">{description}</p>
  </motion.div>
)

// Process Step Component
const ProcessStep: React.FC<ProcessStepProps> = ({ stepNumber, icon, title, description }) => (
  <motion.div
    className="bg-slate-800/60 border border-slate-600/50 rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-center relative backdrop-blur-sm"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: stepNumber * 0.1 }}
  >
    <div className="absolute -top-3 lg:-top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs lg:text-sm font-bold text-white">
      {stepNumber}
    </div>
    <div className="text-2xl lg:text-3xl mb-3 lg:mb-4 text-purple-500">{icon}</div>
    <h3 className="text-lg sm:text-xl font-bold mb-3 lg:mb-4 text-white">{title}</h3>
    <p className="text-slate-400 text-sm sm:text-base">{description}</p>
  </motion.div>
)

// Stat Item Component
const StatItem: React.FC<StatItemProps> = ({ number, label }) => (
  <motion.div
    className="p-3 lg:p-4 text-center"
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-1 lg:mb-2">
      {number}
    </div>
    <div className="text-slate-400 font-medium text-xs sm:text-sm lg:text-base">{label}</div>
  </motion.div>
)

// Hero Section Component
const Hero: React.FC = () => (
  <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 text-center relative z-10 max-w-7xl mx-auto">
    <motion.div
      className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs sm:text-sm text-purple-300 mb-6 sm:mb-8 backdrop-blur-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      ✨ Prepaid Gas Credits • Unlinkable Spending
    </motion.div>
    
    <motion.h1
      className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-4 sm:mb-6 leading-tight"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <div className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
        Prepaid Gas
      </div>
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
        Credits
      </div>
    </motion.h1>
    
    <motion.p
      className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-xl lg:max-w-2xl mx-auto mb-8 lg:mb-10 leading-relaxed px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
    >
      Like prepaid mobile cards for blockchain gas. Buy credit anonymously, 
      spend without revealing which "card" you purchased. Built on{' '}
      <span className="text-purple-400 font-semibold">ERC-4337 </span> with{' '}
      <span className="text-purple-400 font-semibold">Semaphore Protocol</span>.
    </motion.p>
    
    <motion.div
      className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.6 }}
    >
      <Button 
        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl lg:rounded-2xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-1 min-h-[48px]"
      >
        Launch App →
      </Button>
      <Button 
        variant="outline"
        className="w-full sm:w-auto bg-slate-700/80 border-2 border-slate-500 text-slate-200 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl lg:rounded-2xl backdrop-blur-sm hover:bg-slate-600/80 hover:border-slate-400 min-h-[48px]"
      >
        View Docs
      </Button>
    </motion.div>

    <motion.div
      className="mt-8 sm:mt-12"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.8 }}
    >
      <GasCard />
    </motion.div>
  </section>
)

// Features Section Component
const Features: React.FC = () => {
  const features = [
    {
      icon: '🛡️',
      title: 'Anonymous Purchase',
      description: 'Buy gas credit like a prepaid card - no one can trace your spending back to the purchase',
      iconGradient: 'bg-gradient-to-br from-blue-500 to-purple-600'
    },
    {
      icon: '👥',
      title: 'Shared Credit Pools',
      description: 'Like buying cards from a busy store - more buyers means better anonymity for everyone',
      iconGradient: 'bg-gradient-to-br from-purple-600 to-pink-500'
    },
    {
      icon: '⚡',
      title: 'Instant Gas Payments',
      description: 'Spend your credit seamlessly - just like using mobile data, but for blockchain transactions',
      iconGradient: 'bg-gradient-to-br from-pink-500 to-red-500'
    }
  ]

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        className="text-center mb-8 sm:mb-12 lg:mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          How Prepaid Gas Credits Work
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-xl lg:max-w-2xl mx-auto px-4">
          Just like mobile prepaid cards, but for blockchain gas - buy anonymously, spend unlinkably
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  )
}

// Process Section Component
const Process: React.FC = () => {
  const steps = [
    {
      stepNumber: 1,
      icon: '💳',
      title: 'Buy Gas Credit',
      description: 'Purchase gas credit anonymously, like buying a prepaid mobile card with cash'
    },
    {
      stepNumber: 2,
      icon: '🔑',
      title: 'Get Your Account',
      description: 'Receive a unique account ID (like a phone number) to spend your credit'
    },
    {
      stepNumber: 3,
      icon: '✅',
      title: 'Spend Unlinkably',
      description: 'Pay for transactions - observers can\'t trace spending back to your purchase'
    }
  ]

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        className="text-center mb-8 sm:mb-12 lg:mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent px-4">
          Simple 3-Step Process
        </h2>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {steps.map((step) => (
          <ProcessStep key={step.stepNumber} {...step} />
        ))}
      </div>
    </section>
  )
}

// Stats Section Component
const Stats: React.FC = () => {
  const stats = [
    { number: '847', label: 'Active Gas Cards' },
    { number: '23.8', label: 'ETH in Credit Pools' },
    { number: '3,421', label: 'Unlinkable Transactions' },
    { number: '12', label: 'Credit Pool Stores' }
  ]

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30 border-t border-b border-slate-600/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
        {stats.map((stat, index) => (
          <StatItem key={index} {...stat} />
        ))}
      </div>
    </section>
  )
}

// CTA Section Component
const CTA: React.FC = () => (
  <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-t border-purple-500/20">
    <motion.div
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
        Ready for Prepaid Gas Credits?
      </h2>
      <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-8 sm:mb-10 px-4 leading-relaxed">
        Get your anonymous gas credit. Buy once, spend many times - 
        just like prepaid mobile, but for blockchain transactions.
      </p>
      <Button 
        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl lg:rounded-2xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-1 min-h-[48px]"
      >
        Launch Protocol →
      </Button>
      <div className="text-xs sm:text-sm text-slate-400 font-mono mt-4 sm:mt-6 px-4">
        Anonymous Credit • Unlinkable Spending • ERC-4337 Compatible
      </div>
    </motion.div>
  </section>
)

// Main Page Component
const PrepaidGasLanding: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden">
    <FloatingBackground />
    <Header />
    <Hero />
    <Features />
    <Process />
    <Stats />
    <CTA />
  </div>
)

export default PrepaidGasLanding