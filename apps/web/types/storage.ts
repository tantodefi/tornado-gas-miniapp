//file:prepaid-gas-website/apps/web/types/storage.ts
/**
 * Client-side storage and data persistence type definitions
 * REFACTORED: Updated to match new PoolCard structure
 */

import type { PoolCard, CardFilterOptions } from "./card";

/**
 * IndexedDB configuration
 */
export interface IndexedDBConfig {
  dbName: string; // Database name
  version: number; // Database version
  storeName: string; // Object store name
  indexes?: {
    // Optional indexes
    name: string;
    keyPath: string;
    options?: IDBIndexParameters;
  }[];
}

/**
 * Storage operation result
 */
export interface StorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

/**
 * Storage statistics - UPDATED: Removed pending card counts
 */
export interface StorageStats {
  totalCards: number;
  totalSize: number; // Storage size in bytes
  lastAccessed: string; // ISO timestamp
  indexedDBSupported: boolean;
  storageQuotaUsed?: number; // Percentage of quota used
  storageQuotaAvailable?: number; // Available storage in bytes
}

/**
 * Backup data structure for export/import
 */
export interface BackupData {
  version: string; // Backup format version
  timestamp: string; // ISO timestamp of backup
  cards: PoolCard[]; // All stored cards
  metadata: {
    // Backup metadata
    totalCards: number;
    exportSource: string; // App version/source
    encryptionUsed: boolean;
    checksum: string; // Data integrity hash
  };
}

/**
 * Import validation result
 */
export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  cardCount: number;
  duplicateCards: string[]; // IDs of duplicate cards
  compatibleVersion: boolean;
}

/**
 * Storage query options - UPDATED: Use new filter options
 */
export interface StorageQueryOptions {
  filter?: CardFilterOptions;
  sort?: {
    field: keyof PoolCard;
    direction: "asc" | "desc";
  };
  limit?: number;
  offset?: number;
}
