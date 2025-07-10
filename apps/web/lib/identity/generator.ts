//file:prepaid-gas-website/apps/web/lib/identity/generator.ts

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
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof crypto !== "undefined";
}

/**
 * Generate a secure BIP39 12-word mnemonic
 */
function generateSecureMnemonic(): string {
  if (!isBrowser()) {
    throw new Error("Mnemonic generation requires browser environment");
  }
  return generateMnemonic(wordlist, 128);
}

/**
 * Generate private key from mnemonic using standard Ethereum derivation
 */
function generatePrivateKeyFromMnemonic(mnemonic: string): string {
  const seed = mnemonicToSeedSync(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed);
  const derivedKey = hdKey.derive("m/44'/60'/0'/0/0");

  if (!derivedKey.privateKey) {
    throw new Error("Failed to derive private key");
  }

  return bytesToHex(derivedKey.privateKey);
}

/**
 * Create Semaphore identity from mnemonic
 */
function createSemaphoreIdentity(mnemonic: string): {
  identity: Identity;
  privateKey: string;
} {
  if (!validateBip39(mnemonic, wordlist)) {
    throw new Error("Invalid mnemonic");
  }

  const privateKey = generatePrivateKeyFromMnemonic(mnemonic);
  const identity = new Identity(privateKey);

  return { identity, privateKey };
}

/**
 * Generate a unique card ID
 */
function generateCardId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `PGC-${timestamp.slice(-4).toUpperCase()}${randomPart}`;
}

/**
 * Complete identity generation result
 */
interface IdentityGenerationResult {
  cardId: string;
  mnemonic: string;
  privateKey: string;
  identity: Identity;
}

/**
 * Generate complete identity for pool card
 */
function generateCompleteIdentity(): IdentityGenerationResult {
  validateSecureContext();

  const mnemonic = generateSecureMnemonic();
  const { identity, privateKey } = createSemaphoreIdentity(mnemonic);
  const cardId = generateCardId();

  return {
    cardId,
    mnemonic,
    privateKey,
    identity,
  };
}

/**
 * Restore identity from existing mnemonic
 */
function restoreIdentityFromMnemonic(mnemonic: string): {
  identity: Identity;
  privateKey: string;
} | null {
  try {
    if (!validateBip39(mnemonic, wordlist)) {
      return null;
    }
    return createSemaphoreIdentity(mnemonic);
  } catch {
    return null;
  }
}

/**
 * Validate secure environment before generating sensitive data
 */
function validateSecureContext(): void {
  if (!isBrowser()) {
    throw new Error("Identity generation requires browser environment");
  }

  const isSecure =
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost";

  if (!isSecure) {
    throw new Error("Identity generation requires HTTPS or localhost");
  }

  if (!window.crypto?.getRandomValues) {
    throw new Error("Secure random number generation not available");
  }
}

/**
 * Validate mnemonic using BIP39 standard
 */
function validateMnemonic(mnemonic: string): boolean {
  try {
    return validateBip39(mnemonic, wordlist);
  } catch {
    return false;
  }
}

export {
  generateCompleteIdentity,
  restoreIdentityFromMnemonic,
  validateMnemonic,
  validateSecureContext,
};
