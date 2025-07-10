/**
 * Data transformers for the prepaid gas paymaster system
 * Updated for the new network-aware schema structure
 *
 * Handles BigInt serialization/deserialization and provides utility functions
 * for formatting blockchain data for API responses and client consumption.
 */

import type {
  RevenueWithdrawal,
  NullifierUsage,
  DailyPoolStats,
  DailyGlobalStats,
  SerializedRevenueWithdrawal,
  SerializedNullifierUsage,
  SerializedDailyPoolStats,
  SerializedDailyGlobalStats,
  SerializedNetworkInfo,
} from "../types/subgraph.js";

/**
 * ========================================
 * UTILITY FUNCTIONS
 * ========================================
 */

/**
 * Safely parse a BigInt from a string
 *
 * @param value - String value to parse
 * @returns BigInt value or 0n if invalid
 */
export function safeBigIntParse(value: string | number | bigint): bigint {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number") {
    return BigInt(Math.floor(value));
  }

  try {
    return BigInt(value);
  } catch (error) {
    console.warn(`Failed to parse BigInt from value: ${value}`, error);
    return 0n;
  }
}

/**
 * ========================================
 * GENERIC CONVERSION FUNCTIONS
 * ========================================
 */

/**
 * Convert BigInt values to strings recursively
 *
 * @param obj - Entity object to convert
 * @returns Serialized entity with BigInt values as strings
 */
export function convertBigIntsToStrings<T>(obj: T): any {
  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertBigIntsToStrings(item));
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = convertBigIntsToStrings(obj[key]);
      }
    }
    return result;
  }

  return obj;
}

/**
 * Convert string values back to BigInt for specified fields
 *
 * @param obj - Serialized entity object
 * @param bigIntFields - Array of field names that should be converted to BigInt
 * @returns Entity with BigInt values restored
 */
export function convertStringsToBigInts<T>(
  obj: T,
  bigIntFields: string[],
): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertStringsToBigInts(item, bigIntFields));
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (bigIntFields.includes(key) && typeof obj[key] === "string") {
          result[key] = safeBigIntParse(obj[key]);
        } else if (typeof obj[key] === "object") {
          result[key] = convertStringsToBigInts(obj[key], bigIntFields);
        } else {
          result[key] = obj[key];
        }
      }
    }
    return result;
  }

  return obj;
}

/**
 * ========================================
 * BIGINT FIELD DEFINITIONS
 * ========================================
 */

// Define which fields are BigInt for each entity type
const BIGINT_FIELDS = {
  paymasterContract: [
    "chainId",
    "totalUsersDeposit",
    "currentDeposit",
    "revenue",
    "deployedAtBlock",
    "deployedAtTimestamp",
    "lastUpdatedBlock",
    "lastUpdatedTimestamp",
  ],
  pool: [
    "poolId",
    "chainId",
    "joiningFee",
    "totalDeposits",
    "memberCount",
    "currentMerkleRoot",
    "createdAtBlock",
    "createdAtTimestamp",
    "lastUpdatedBlock",
    "lastUpdatedTimestamp",
  ],
  poolMember: [
    "chainId",
    "memberIndex",
    "identityCommitment",
    "merkleRootWhenAdded",
    "addedAtBlock",
    "addedAtTimestamp",
    "gasUsed",
    "nullifier",
  ],
  merkleRoot: ["chainId", "root", "createdAtBlock", "createdAtTimestamp"],
  userOperation: [
    "chainId",
    "actualGasCost",
    "nullifier",
    "executedAtBlock",
    "executedAtTimestamp",
    "gasPrice",
    "totalGasUsed",
  ],
  revenueWithdrawal: [
    "chainId",
    "amount",
    "withdrawnAtBlock",
    "withdrawnAtTimestamp",
  ],
  nullifierUsage: [
    "nullifier",
    "chainId",
    "gasUsed",
    "firstUsedAtBlock",
    "firstUsedAtTimestamp",
  ],
  dailyPoolStats: [
    "chainId",
    "newMembers",
    "userOperations",
    "gasSpent",
    "revenueGenerated",
    "totalMembers",
    "totalDeposits",
    "createdAtBlock",
    "createdAtTimestamp",
  ],
  dailyGlobalStats: [
    "chainId",
    "newPools",
    "totalNewMembers",
    "totalUserOperations",
    "totalGasSpent",
    "totalRevenueGenerated",
    "totalActivePools",
    "totalMembers",
  ],
  networkInfo: [
    "chainId",
    "totalPaymasters",
    "totalPools",
    "totalMembers",
    "totalUserOperations",
    "totalGasSpent",
    "totalRevenue",
    "firstDeploymentBlock",
    "firstDeploymentTimestamp",
    "lastActivityBlock",
    "lastActivityTimestamp",
  ],
};

/**
 * ========================================
 * SERIALIZATION FUNCTIONS
 * ========================================
 */

export function serializeRevenueWithdrawal(
  entity: RevenueWithdrawal,
): SerializedRevenueWithdrawal {
  return convertBigIntsToStrings(entity);
}

export function serializeNullifierUsage(
  entity: NullifierUsage,
): SerializedNullifierUsage {
  return convertBigIntsToStrings(entity);
}

export function serializeDailyPoolStats(
  entity: DailyPoolStats,
): SerializedDailyPoolStats {
  return convertBigIntsToStrings(entity);
}

export function serializeDailyGlobalStats(
  entity: DailyGlobalStats,
): SerializedDailyGlobalStats {
  return convertBigIntsToStrings(entity);
}

/**
 * ========================================
 * DESERIALIZATION FUNCTIONS
 * ========================================
 */

export function deserializeRevenueWithdrawal(
  entity: SerializedRevenueWithdrawal,
): RevenueWithdrawal {
  return convertStringsToBigInts(entity, BIGINT_FIELDS.revenueWithdrawal);
}

export function deserializeNullifierUsage(
  entity: SerializedNullifierUsage,
): NullifierUsage {
  return convertStringsToBigInts(entity, BIGINT_FIELDS.nullifierUsage);
}

export function deserializeDailyPoolStats(
  entity: SerializedDailyPoolStats,
): DailyPoolStats {
  return convertStringsToBigInts(entity, BIGINT_FIELDS.dailyPoolStats);
}

export function deserializeDailyGlobalStats(
  entity: SerializedDailyGlobalStats,
): DailyGlobalStats {
  return convertStringsToBigInts(entity, BIGINT_FIELDS.dailyGlobalStats);
}

/**
 * ========================================
 * EXPORT CONVENIENCE FUNCTIONS
 * ========================================
 */

/**
 * All serialization functions
 */
export const serializers = {
  revenueWithdrawal: serializeRevenueWithdrawal,
  nullifierUsage: serializeNullifierUsage,
  dailyPoolStats: serializeDailyPoolStats,
  dailyGlobalStats: serializeDailyGlobalStats,
};

/**
 * All deserialization functions
 */
export const deserializers = {
  revenueWithdrawal: deserializeRevenueWithdrawal,
  nullifierUsage: deserializeNullifierUsage,
  dailyPoolStats: deserializeDailyPoolStats,
  dailyGlobalStats: deserializeDailyGlobalStats,
};
