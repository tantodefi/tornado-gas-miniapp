// lib/storage/indexed-db.ts

/**
 * IndexedDB storage utilities for prepaid gas cards
 * Replaces localStorage with more robust browser storage
 */

import type { PoolCard } from "@/types";

const DB_NAME = "prepaid-gas-cards";
const DB_VERSION = 1;
const STORE_NAME = "cards";

/**
 * Initialize IndexedDB database
 */
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("poolId", "poolId", { unique: false });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

/**
 * Get all cards from IndexedDB
 */
export async function loadCardsFromIndexedDB(): Promise<PoolCard[]> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to load cards from IndexedDB:", error);
    return [];
  }
}

/**
 * Save a card to IndexedDB
 */
export async function saveCardToIndexedDB(card: PoolCard): Promise<void> {
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
    console.error("Failed to save card to IndexedDB:", error);
    throw error;
  }
}

/**
 * Update a card in IndexedDB
 */
export async function updateCardInIndexedDB(
  cardId: string,
  updates: Partial<PoolCard>,
): Promise<PoolCard | null> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Get existing card
    const getRequest = store.get(cardId);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const existingCard = getRequest.result;
        if (!existingCard) {
          resolve(null);
          return;
        }

        const updatedCard = { ...existingCard, ...updates };
        const putRequest = store.put(updatedCard);

        putRequest.onsuccess = () => resolve(updatedCard);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error("Failed to update card in IndexedDB:", error);
    throw error;
  }
}

/**
 * Delete a card from IndexedDB
 */
export async function deleteCardFromIndexedDB(cardId: string): Promise<void> {
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
    console.error("Failed to delete card from IndexedDB:", error);
    throw error;
  }
}

/**
 * Get cards by status
 */
export async function getCardsByStatus(
  status: PoolCard["status"],
): Promise<PoolCard[]> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("status");

    return new Promise((resolve, reject) => {
      const request = index.getAll(status);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to get cards by status:", error);
    return [];
  }
}

/**
 * Get cards by pool ID
 */
export async function getCardsByPoolId(poolId: string): Promise<PoolCard[]> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("poolId");

    return new Promise((resolve, reject) => {
      const request = index.getAll(poolId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to get cards by pool ID:", error);
    return [];
  }
}

/**
 * Find a specific card by ID
 */
export async function findCardInIndexedDB(
  cardId: string,
): Promise<PoolCard | null> {
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
    console.error("Failed to find card in IndexedDB:", error);
    return null;
  }
}

/**
 * Clear all cards from IndexedDB
 */
export async function clearAllCardsFromIndexedDB(): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to clear cards from IndexedDB:", error);
    throw error;
  }
}

/**
 * Get card statistics
 */
export async function getCardStatsFromIndexedDB() {
  try {
    const cards = await loadCardsFromIndexedDB();

    const total = cards.length;
    const active = cards.filter((card) => card.status === "active").length;
    const pending = cards.filter(
      (card) => card.status === "pending-topup",
    ).length;
    const totalValue = cards
      .filter((card) => card.status === "active" && card.balance)
      .reduce((sum, card) => sum + parseFloat(card.balance || "0"), 0);

    return {
      total,
      active,
      pending,
      totalValue,
    };
  } catch (error) {
    console.error("Failed to get card stats:", error);
    return {
      total: 0,
      active: 0,
      pending: 0,
      totalValue: 0,
    };
  }
}
