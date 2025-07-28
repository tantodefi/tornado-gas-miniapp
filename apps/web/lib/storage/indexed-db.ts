//file:prepaid-gas-website/apps/web/lib/storage/indexed-db.ts

import { PaymasterType } from "@prepaid-gas/constants";

// Import types from card.ts
export type PoolCard = {
  id: string;
  poolInfo: {
    poolId: string;
    joiningFee: string;
    network: string;
    paymasterType: PaymasterType;
  };
  identity: {
    mnemonic: string;
    privateKey: string;
  };
  paymasterContract: string;
  paymasterContext: string;
  transactionHash: string;
  chainId: string;
  purchasedAt: string;
  paymentStatus: "pending" | "completed";
};

type CardStats = {
  total: number;
  completed: number;
};

const DB_NAME = "prepaid-gas-cards";
const DB_VERSION = 2;
const STORE_NAME = "cards";

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

/**
 * Initialize IndexedDB database with browser check
 */
async function initDB(): Promise<IDBDatabase> {
  if (!isBrowser()) {
    throw new Error("IndexedDB is not available in this environment");
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Clear old stores if they exist
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }

      // Create new store with proper structure
      const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex("poolId", "poolInfo.poolId", { unique: false });
      store.createIndex("paymentStatus", "paymentStatus", { unique: false });
      store.createIndex("purchasedAt", "purchasedAt", { unique: false });
    };
  });
}

/**
 * Get all completed cards from IndexedDB
 */
async function loadCompletedCards(): Promise<PoolCard[]> {
  if (!isBrowser()) {
    console.warn("IndexedDB not available, returning empty array");
    return [];
  }

  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("paymentStatus");

    return new Promise((resolve, reject) => {
      const request = index.getAll("completed");
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to load completed cards:", error);
    return [];
  }
}

/**
 * Save a card to IndexedDB
 */
async function saveCard(card: PoolCard): Promise<void> {
  if (!isBrowser()) {
    throw new Error("IndexedDB is not available in this environment");
  }

  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.put(card);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to save card:", error);
    throw error;
  }
}

/**
 * Update card payment status to completed
 */
async function markCardAsCompleted(
  cardId: string,
  transactionHash: string,
): Promise<PoolCard | null> {
  if (!isBrowser()) {
    console.warn("IndexedDB not available, cannot mark card as completed");
    return null;
  }

  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const getRequest = store.get(cardId);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const existingCard = getRequest.result;
        if (!existingCard) {
          resolve(null);
          return;
        }

        const updatedCard: PoolCard = {
          ...existingCard,
          transactionHash,
          paymentStatus: "completed",
        };

        const putRequest = store.put(updatedCard);
        putRequest.onsuccess = () => resolve(updatedCard);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error("Failed to mark card as completed:", error);
    throw error;
  }
}

/**
 * Delete a card from IndexedDB
 */
async function deleteCard(cardId: string): Promise<void> {
  if (!isBrowser()) {
    console.warn("IndexedDB not available, cannot delete card");
    return;
  }

  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(cardId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to delete card:", error);
    throw error;
  }
}

/**
 * Find a specific card by ID
 */
async function findCard(cardId: string): Promise<PoolCard | null> {
  if (!isBrowser()) {
    console.warn("IndexedDB not available, cannot find card");
    return null;
  }

  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(cardId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to find card:", error);
    return null;
  }
}

/**
 * Get card statistics
 */
async function getCardStats(): Promise<CardStats> {
  if (!isBrowser()) {
    console.warn("IndexedDB not available, returning default stats");
    return { total: 0, completed: 0 };
  }

  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const allRequest = store.getAll();

      allRequest.onsuccess = () => {
        const allCards = allRequest.result || [];
        const completed = allCards.filter(
          (card) => card.paymentStatus === "completed",
        ).length;

        resolve({
          total: allCards.length,
          completed,
        });
      };

      allRequest.onerror = () => reject(allRequest.error);
    });
  } catch (error) {
    console.error("Failed to get card stats:", error);
    return { total: 0, completed: 0 };
  }
}

export {
  saveCard,
  loadCompletedCards,
  markCardAsCompleted,
  deleteCard,
  findCard,
  getCardStats,
};
