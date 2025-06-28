//file:prepaid-gas-website/apps/web/types/storage.ts
/**
 * Client-side storage and data persistence type definitions
 * Single source of truth for IndexedDB, local storage, and data backup types
 */

import type { PoolCard, CardStats, CardFilterOptions } from "./card";

/**
 * Storage card interface (alias for consistency)
 * This is the primary interface for storing cards in IndexedDB
 */
export interface StorageCard extends PoolCard {}

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
 * Storage statistics
 */
export interface StorageStats {
  totalCards: number;
  activeCards: number;
  pendingCards: number;
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
  cards: StorageCard[]; // All stored cards
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
 * Storage migration configuration
 */
export interface MigrationConfig {
  fromVersion: number;
  toVersion: number;
  migrationSteps: Array<{
    step: number;
    description: string;
    execute: (data: any) => Promise<any>;
  }>;
}

/**
 * Storage encryption configuration
 */
export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string; // e.g., 'AES-GCM'
  keyDerivation: string; // e.g., 'PBKDF2'
  iterations: number; // Key derivation iterations
  saltLength: number; // Salt length in bytes
}

/**
 * Storage query options
 */
export interface StorageQueryOptions {
  filter?: CardFilterOptions;
  sort?: {
    field: keyof StorageCard;
    direction: "asc" | "desc";
  };
  limit?: number;
  offset?: number;
}

/**
 * Storage transaction options
 */
export interface StorageTransaction {
  mode: "readonly" | "readwrite";
  storeName: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

/**
 * Storage cleanup configuration
 */
export interface CleanupConfig {
  expiredCards: boolean; // Remove expired cards
  maxAge: number; // Max age in days
  maxCards: number; // Max number of cards to keep
  keepActiveCards: boolean; // Never delete active cards
  backupBeforeCleanup: boolean; // Create backup before cleanup
}

/**
 * Storage monitoring data
 */
export interface StorageMonitoring {
  operations: {
    // Operation statistics
    reads: number;
    writes: number;
    deletes: number;
    errors: number;
  };
  performance: {
    // Performance metrics
    averageReadTime: number;
    averageWriteTime: number;
    slowestOperation: number;
  };
  quotaUsage: {
    // Storage quota information
    used: number;
    available: number;
    percentage: number;
  };
  lastReset: string; // When stats were last reset
}

/**
 * Sync status for storage operations
 */
export interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  pendingChanges: number;
  conflictResolution: "local" | "remote" | "manual";
  syncInProgress: boolean;
}

/**
 * Storage event types for listeners
 */
export type StorageEventType =
  | "card-created"
  | "card-updated"
  | "card-deleted"
  | "backup-created"
  | "storage-cleared"
  | "quota-warning"
  | "migration-completed";

/**
 * Storage event data
 */
export interface StorageEvent {
  type: StorageEventType;
  cardId?: string;
  timestamp: number;
  data?: any;
}

/**
 * Storage cache configuration
 */
export interface CacheConfig {
  enabled: boolean;
  maxAge: number; // Cache TTL in milliseconds
  maxSize: number; // Max cached items
  strategy: "lru" | "fifo"; // Cache eviction strategy
}

/**
 * Data validation rules for storage
 */
export interface ValidationRules {
  cardId: {
    required: boolean;
    pattern?: RegExp;
    maxLength?: number;
  };
  poolId: {
    required: boolean;
    type: "string" | "number";
  };
  mnemonic: {
    required: boolean;
    wordCount: number;
    checksum: boolean;
  };
}

/**
 * Storage security configuration
 */
export interface SecurityConfig {
  encryption: EncryptionConfig;
  accessControl: {
    requireUserGesture: boolean; // Require user interaction
    sessionTimeout: number; // Session timeout in minutes
    maxFailedAttempts: number; // Max failed access attempts
  };
  integrity: {
    checksumValidation: boolean; // Validate data checksums
    tamperDetection: boolean; // Detect data tampering
  };
}

/**
 * Storage recovery options
 */
export interface RecoveryOptions {
  autoRecovery: boolean; // Attempt automatic recovery
  backupLocations: string[]; // Backup storage locations
  recoveryMethods: Array<{
    name: string;
    description: string;
    execute: () => Promise<StorageResult>;
  }>;
}
