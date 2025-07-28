//file:prepaid-gas-website/apps/web/types/pool.ts
/**
 * Pool-related type definitions
 * Simplified to directly use @prepaid-gas/data package types
 */

import type {
  SerializedActivity,
  SerializedPaymasterContract,
} from "@prepaid-gas/data";

export type Pool = SerializedPaymasterContract;
export type Activity = SerializedActivity;
