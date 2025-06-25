"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateCompleteIdentity,
  formatMnemonicForDisplay,
  IdentitySecurity,
  type GenerateIdentityResult,
} from "@/lib/identity/identity-generator";
import {
  PoolCard,
  saveCardToIndexedDB,
} from "@/lib/storage/indexed-db-storage";

interface Pool {
  id: string;
  poolId: string;
  joiningFee: string;
  membersCount: string;
  network: {
    name: string;
    chainId: number;
    chainName: string;
    networkName: string;
    contracts: {
      paymaster: string;
      verifier?: string;
    };
  };
}

interface IdentityGenerationFlowProps {
  pool: Pool;
  onComplete: (card: PoolCard) => void;
  onCancel: () => void;
}

type FlowStep =
  | "generating"
  | "display-mnemonic"
  | "confirm-mnemonic"
  | "success";

/**
 * Complete identity generation flow for joining a pool
 * Handles mnemonic generation, display, confirmation, and card creation
 */
const IdentityGenerationFlow: React.FC<IdentityGenerationFlowProps> = ({
  pool,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>("generating");
  const [identity, setIdentity] = useState<GenerateIdentityResult | null>(null);
  const [confirmationWords, setConfirmationWords] = useState<string[]>([]);
  const [confirmationError, setConfirmationError] = useState<string>("");
  const [randomIndices, setRandomIndices] = useState<number[]>([]);
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  // Generate identity on mount
  useEffect(() => {
    const generateIdentity = async () => {
      try {
        // Validate secure environment
        IdentitySecurity.validateSecureContext();

        // Simulate loading for better UX
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Generate the identity
        const newIdentity = generateCompleteIdentity();
        setIdentity(newIdentity);

        // Generate random indices for confirmation (ask for 3 random words)
        const indices: number[] = [];
        while (indices.length < 3) {
          const randomIndex = Math.floor(Math.random() * 12);
          if (!indices.includes(randomIndex)) {
            indices.push(randomIndex);
          }
        }
        setRandomIndices(indices.sort((a, b) => a - b));

        setCurrentStep("display-mnemonic");
      } catch (error) {
        console.error("Failed to generate identity:", error);
        alert("Failed to generate secure identity. Please try again.");
        onCancel();
      }
    };

    generateIdentity();
  }, [onCancel]);

  const handleMnemonicConfirmed = () => {
    setCurrentStep("confirm-mnemonic");
    setConfirmationWords(new Array(3).fill(""));
  };

  const handleConfirmationWordChange = (index: number, word: string) => {
    const newWords = [...confirmationWords];
    newWords[index] = word.toLowerCase().trim();
    setConfirmationWords(newWords);
    setConfirmationError("");
  };

  const handleConfirmationSubmit = async () => {
    if (!identity) return;

    const mnemonicWords = identity.mnemonic.split(" ");
    const isValid = randomIndices.every((wordIndex, confirmIndex) => {
      return mnemonicWords[wordIndex] === confirmationWords[confirmIndex];
    });

    if (!isValid) {
      setConfirmationError(
        "The words you entered don't match. Please check and try again.",
      );
      return;
    }

    // Create and save the card
    setIsCreatingCard(true);
    try {
      const newCard: PoolCard = {
        id: identity.cardId,
        poolId: pool.poolId,
        poolDetails: {
          joiningFee: pool.joiningFee,
          membersCount: pool.membersCount,
          network: pool.network,
        },
        identity: {
          mnemonic: identity.mnemonic,
          privateKey: identity.privateKey,
          commitment: identity.commitment,
        },
        paymasterContract: pool.network.contracts.paymaster,
        createdAt: new Date().toISOString(),
        status: "pending-topup",
        expiresAt: identity.expiresAt,
      };

      await saveCardToIndexedDB(newCard);
      setCurrentStep("success");

      // Complete after showing success
      setTimeout(() => {
        onComplete(newCard);
      }, 2000);
    } catch (error) {
      console.error("Failed to create card:", error);
      alert("Failed to create card. Please try again.");
      onCancel();
    } finally {
      setIsCreatingCard(false);
    }
  };

  if (!identity && currentStep !== "generating") {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {currentStep === "generating" && <GeneratingStep key="generating" />}

          {currentStep === "display-mnemonic" && identity && (
            <DisplayMnemonicStep
              key="display"
              mnemonic={identity.mnemonic}
              onConfirmed={handleMnemonicConfirmed}
              onCancel={onCancel}
            />
          )}

          {currentStep === "confirm-mnemonic" && identity && (
            <ConfirmMnemonicStep
              key="confirm"
              randomIndices={randomIndices}
              mnemonicWords={identity.mnemonic.split(" ")}
              confirmationWords={confirmationWords}
              onWordChange={handleConfirmationWordChange}
              onSubmit={handleConfirmationSubmit}
              onBack={() => setCurrentStep("display-mnemonic")}
              error={confirmationError}
              isLoading={isCreatingCard}
            />
          )}

          {currentStep === "success" && identity && (
            <SuccessStep
              key="success"
              cardId={identity.cardId}
              poolId={pool.poolId}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * Step 1: Generating identity with loading animation
 */
const GeneratingStep: React.FC = () => (
  <motion.div
    className="card-prepaid-glass card-content-lg text-center"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-6xl mb-6">🔐</div>
    <h2 className="text-2xl font-bold text-white mb-4">
      Generating Your Secure Identity
    </h2>
    <p className="text-slate-300 mb-8">
      Creating your unique 12-word recovery phrase using secure cryptography...
    </p>

    {/* Loading animation */}
    <div className="flex justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-purple-500 rounded-full"
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
);

/**
 * Step 2: Display mnemonic for user to save
 */
interface DisplayMnemonicStepProps {
  mnemonic: string;
  onConfirmed: () => void;
  onCancel: () => void;
}

const DisplayMnemonicStep: React.FC<DisplayMnemonicStepProps> = ({
  mnemonic,
  onConfirmed,
  onCancel,
}) => {
  const [isConfirmChecked, setIsConfirmChecked] = useState(false);
  const formattedWords = formatMnemonicForDisplay(mnemonic);

  return (
    <motion.div
      className="card-prepaid-glass card-content-lg"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">📝</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Save Your Recovery Phrase
        </h2>
        <p className="text-slate-300">
          Write down these 12 words in order. You'll need them to access your
          gas card.
        </p>
      </div>

      {/* Security warning */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-red-400 text-xl">⚠️</div>
          <div>
            <h3 className="text-red-400 font-bold text-sm mb-1">
              Important Security Notice
            </h3>
            <ul className="text-red-300 text-xs space-y-1">
              <li>• Never share these words with anyone</li>
              <li>• Store them offline (write on paper)</li>
              <li>• Anyone with these words can access your card</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mnemonic display */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {formattedWords.map(({ index, word }) => (
          <motion.div
            key={index}
            className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="text-xs text-slate-400 mb-1">{index}</div>
            <div className="text-white font-mono text-sm">{word}</div>
          </motion.div>
        ))}
      </div>

      {/* Confirmation checkbox */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isConfirmChecked}
            onChange={(e) => setIsConfirmChecked(e.target.checked)}
            className="mt-1 w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
          />
          <span className="text-sm text-slate-300">
            I have written down my 12-word recovery phrase and stored it in a
            safe place. I understand that losing these words means losing access
            to my gas card forever.
          </span>
        </label>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="btn-prepaid-outline btn-md flex-1"
        >
          Cancel
        </button>
        <button
          onClick={onConfirmed}
          disabled={!isConfirmChecked}
          className="btn-prepaid-primary btn-md flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          I've Saved It →
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Step 3: Confirm mnemonic by asking for random words
 */
interface ConfirmMnemonicStepProps {
  randomIndices: number[];
  mnemonicWords: string[];
  confirmationWords: string[];
  onWordChange: (index: number, word: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  error: string;
  isLoading: boolean;
}

const ConfirmMnemonicStep: React.FC<ConfirmMnemonicStepProps> = ({
  randomIndices,
  mnemonicWords,
  confirmationWords,
  onWordChange,
  onSubmit,
  onBack,
  error,
  isLoading,
}) => (
  <motion.div
    className="card-prepaid-glass card-content-lg"
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-center mb-6">
      <div className="text-4xl mb-4">✅</div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Confirm Your Recovery Phrase
      </h2>
      <p className="text-slate-300">
        Please enter the following words from your recovery phrase to confirm
        you saved it correctly.
      </p>
    </div>

    {/* Confirmation inputs */}
    <div className="space-y-4 mb-6">
      {randomIndices.map((wordIndex, confirmIndex) => (
        <div key={wordIndex}>
          <label className="block text-sm text-slate-400 mb-2">
            Word #{wordIndex + 1}
          </label>
          <input
            type="text"
            value={confirmationWords[confirmIndex] || ""}
            onChange={(e) => onWordChange(confirmIndex, e.target.value)}
            placeholder={`Enter word #${wordIndex + 1}`}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500 transition-colors"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      ))}
    </div>

    {/* Error message */}
    {error && (
      <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )}

    {/* Action buttons */}
    <div className="flex gap-3">
      <button
        onClick={onBack}
        disabled={isLoading}
        className="btn-prepaid-outline btn-md flex-1 disabled:opacity-50"
      >
        ← Back
      </button>
      <button
        onClick={onSubmit}
        disabled={isLoading || confirmationWords.some((word) => !word.trim())}
        className="btn-prepaid-primary btn-md flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Creating Card..." : "Create Gas Card →"}
      </button>
    </div>
  </motion.div>
);

/**
 * Step 4: Success - card created
 */
interface SuccessStepProps {
  cardId: string;
  poolId: string;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ cardId, poolId }) => (
  <motion.div
    className="card-prepaid-glass card-content-lg text-center"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-6xl mb-6">🎉</div>
    <h2 className="text-2xl font-bold text-green-400 mb-4">
      Gas Card Created Successfully!
    </h2>
    <p className="text-slate-300 mb-8">
      Your gas card is ready for Pool {poolId}. Next step: top up your card to
      join the pool and start using anonymous gas payments.
    </p>

    <div className="bg-slate-800/30 rounded-lg p-4 mb-6">
      <div className="text-sm text-slate-400 mb-1">Card ID</div>
      <div className="font-mono text-purple-400">{cardId}</div>
    </div>

    <div className="text-xs text-slate-400">
      Redirecting you to the top-up flow...
    </div>
  </motion.div>
);

export default IdentityGenerationFlow;
