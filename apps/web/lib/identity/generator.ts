//file:prepaid-gas-website/apps/web/lib/constants

import { Identity } from "@semaphore-protocol/identity";
import {
  generateMnemonic,
  mnemonicToSeedSync,
  validateMnemonic as validateBip39,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { HDKey } from "@scure/bip32";
import { bytesToHex } from "viem";

/**
 * Identity generation utilities using proper BIP39/BIP32 standards
 * Security-critical operations using audited libraries
 */

/**
 * Generate a secure BIP39 12-word mnemonic
 * Uses @scure/bip39 - audited and secure implementation
 */
export function generateSecureMnemonic(): string {
  // Generate 128 bits of entropy for 12-word mnemonic
  return generateMnemonic(wordlist, 128);
}

/**
 * Generate private key from mnemonic using BIP32 derivation
 * Uses standard Ethereum derivation path: m/44'/60'/0'/0/0
 */
export function generatePrivateKeyFromMnemonic(mnemonic: string): string {
  // Convert mnemonic to seed
  const seed = mnemonicToSeedSync(mnemonic);

  // Create HD wallet
  const hdKey = HDKey.fromMasterSeed(seed);

  // Derive Ethereum account using standard path m/44'/60'/0'/0/0
  const derivedKey = hdKey.derive("m/44'/60'/0'/0/0");

  if (!derivedKey.privateKey) {
    throw new Error("Failed to derive private key");
  }

  return bytesToHex(derivedKey.privateKey);
}

/**
 * Create Semaphore identity from mnemonic
 */
export function createSemaphoreIdentity(mnemonic: string): {
  identity: Identity;
  privateKey: string;
  commitment: string;
} {
  // Validate mnemonic first
  if (!validateBip39(mnemonic, wordlist)) {
    throw new Error("Invalid mnemonic");
  }

  // Generate private key using proper derivation
  const privateKey = generatePrivateKeyFromMnemonic(mnemonic);

  // Create Semaphore identity using the derived private key
  const identity = new Identity(privateKey);

  return {
    identity,
    privateKey,
    commitment: identity.commitment.toString(),
  };
}

/**
 * Generate a unique card ID
 * Format: PGC-{timestamp}{random} (PGC = Prepaid Gas Card)
 */
export function generateCardId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `PGC-${timestamp.slice(-4).toUpperCase()}${randomPart}`;
}

/**
 * Generate expiration date (2 years from now)
 */
export function generateExpirationDate(): string {
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 2);
  return expirationDate.toISOString();
}

/**
 * Validate mnemonic using BIP39 standard
 */
export function validateMnemonic(mnemonic: string): boolean {
  try {
    return validateBip39(mnemonic, wordlist);
  } catch {
    return false;
  }
}

/**
 * Complete identity generation for pool card
 */
export interface GenerateIdentityResult {
  cardId: string;
  mnemonic: string;
  privateKey: string;
  commitment: string;
  identity: Identity;
  expiresAt: string;
}

export function generateCompleteIdentity(): GenerateIdentityResult {
  // Generate secure BIP39 mnemonic
  const mnemonic = generateSecureMnemonic();

  // Create Semaphore identity
  const { identity, privateKey, commitment } =
    createSemaphoreIdentity(mnemonic);

  // Generate card ID and expiration
  const cardId = generateCardId();
  const expiresAt = generateExpirationDate();

  return {
    cardId,
    mnemonic,
    privateKey,
    commitment,
    identity,
    expiresAt,
  };
}

/**
 * Restore identity from mnemonic
 */
export function restoreIdentityFromMnemonic(mnemonic: string): {
  identity: Identity;
  privateKey: string;
  commitment: string;
} | null {
  try {
    if (!validateMnemonic(mnemonic)) {
      return null;
    }

    return createSemaphoreIdentity(mnemonic);
  } catch (error) {
    console.error("Failed to restore identity from mnemonic:", error);
    return null;
  }
}

/**
 * Format mnemonic for display (with numbered list)
 */
export function formatMnemonicForDisplay(mnemonic: string): Array<{
  index: number;
  word: string;
}> {
  const words = mnemonic.split(" ");
  return words.map((word, index) => ({
    index: index + 1,
    word,
  }));
}

/**
 * Security utilities
 */
export const IdentitySecurity = {
  /**
   * Check if environment is secure for identity generation
   */
  isSecureEnvironment(): boolean {
    if (typeof window === "undefined") return false;
    return (
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost"
    );
  },

  /**
   * Validate environment before generating sensitive data
   */
  validateSecureContext(): void {
    if (!this.isSecureEnvironment()) {
      throw new Error("Identity generation requires HTTPS or localhost");
    }

    if (!window.crypto || !window.crypto.getRandomValues) {
      throw new Error("Secure random number generation not available");
    }
  },
};
