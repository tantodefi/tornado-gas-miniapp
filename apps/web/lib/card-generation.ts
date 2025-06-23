// lib/card-generation.ts
// Utilities for generating unique card IDs and account numbers

/**
 * Generates a unique prepaid gas card ID
 * Format: PG-{timestamp}{random} (e.g., PG-A4B7XY8Z)
 *
 * @returns {string} Unique card ID
 */
export const generateCardId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `PG-${timestamp.slice(-4).toUpperCase()}${randomPart}`;
};

/**
 * Generates a full account number for internal storage
 * Format: XXXX XXXX XXXX XXXX (16 digits in 4 groups)
 *
 * @returns {string} Full account number
 */
export const generateAccountNumber = (): string => {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    const segment = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    segments.push(segment);
  }
  return segments.join(" ");
};

/**
 * Formats account number for display (masks first 3 segments)
 * Input: "1234 5678 9012 3456"
 * Output: "**** **** **** 3456"
 *
 * @param {string} accountNumber - Full account number
 * @returns {string} Masked account number for display
 */
export const formatAccountNumber = (accountNumber: string): string => {
  const segments = accountNumber.split(" ");
  if (segments.length !== 4) {
    throw new Error("Invalid account number format");
  }
  return `**** **** **** ${segments[segments.length - 1]}`;
};

/**
 * Generates a secure random string for additional entropy
 * Used for internal security purposes
 *
 * @param {number} length - Length of random string (default: 16)
 * @returns {string} Random hex string
 */
export const generateSecureRandom = (length: number = 16): string => {
  const chars = "0123456789ABCDEF";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validates card ID format
 * Must match pattern: PG-{8 alphanumeric characters}
 *
 * @param {string} cardId - Card ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidCardId = (cardId: string): boolean => {
  const cardIdPattern = /^PG-[A-Z0-9]{8}$/;
  return cardIdPattern.test(cardId);
};

/**
 * Validates account number format
 * Must match pattern: "**** **** **** XXXX" where XXXX are digits
 *
 * @param {string} accountNumber - Account number to validate
 * @returns {boolean} True if valid format
 */
export const isValidAccountNumber = (accountNumber: string): boolean => {
  const accountPattern = /^\*{4} \*{4} \*{4} \d{4}$/;
  return accountPattern.test(accountNumber);
};

/**
 * Extracts the last 4 digits from a formatted account number
 * Used for display and verification purposes
 *
 * @param {string} accountNumber - Formatted account number
 * @returns {string} Last 4 digits
 */
export const getAccountLastFour = (accountNumber: string): string => {
  const segments = accountNumber.split(" ");
  const last = segments[segments.length - 1];
  if (typeof last !== "string") {
    throw new Error("Invalid account number format");
  }
  return last;
};
/*
 * @returns {string} ISO string of expiration date
 */
export const generateExpirationDate = (): string => {
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 2);
  return expirationDate.toISOString();
};

/**
 * Checks if a card is expired
 *
 * @param {string} expiresAt - ISO string of expiration date
 * @returns {boolean} True if card is expired
 */
export const isCardExpired = (expiresAt: string): boolean => {
  return new Date(expiresAt) < new Date();
};

/**
 * Generates a human-readable card name/label
 * Format: "Gas Card {short-id}" (e.g., "Gas Card A4B7")
 *
 * @param {string} cardId - Full card ID
 * @returns {string} Human-readable card name
 */
export const generateCardDisplayName = (cardId: string): string => {
  if (!isValidCardId(cardId)) {
    throw new Error("Invalid card ID format");
  }
  const shortId = cardId.replace("PG-", "").slice(0, 4);
  return `Gas Card ${shortId}`;
};

/**
 * Card generation statistics and health check
 * Used for monitoring and debugging
 */
export const getGenerationStats = () => {
  const testIterations = 1000;
  const generatedIds = new Set<string>();
  const generatedAccounts = new Set<string>();

  // Test uniqueness
  for (let i = 0; i < testIterations; i++) {
    generatedIds.add(generateCardId());
    generatedAccounts.add(generateAccountNumber());
  }

  const idUniqueness = (generatedIds.size / testIterations) * 100;
  const accountUniqueness = (generatedAccounts.size / testIterations) * 100;

  return {
    idUniqueness: `${idUniqueness.toFixed(2)}%`,
    accountUniqueness: `${accountUniqueness.toFixed(2)}%`,
    testIterations,
    sampleCardId: generateCardId(),
    sampleAccountNumber: formatAccountNumber(generateAccountNumber()),
  };
};

// Export all functions as a namespace for easier imports
export const CardGeneration = {
  generateCardId,
  generateAccountNumber,
  formatAccountNumber,
  generateSecureRandom,
  isValidCardId,
  isValidAccountNumber,
  getAccountLastFour,
  generateExpirationDate,
  isCardExpired,
  generateCardDisplayName,
  getGenerationStats,
};
