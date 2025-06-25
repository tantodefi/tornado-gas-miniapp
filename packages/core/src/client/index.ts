// Client exports - now using @workspace/data
export { PrepaidGasPaymaster } from "./PrepaidGasPaymaster.js";

// Re-export data types and client from @workspace/data
export type {
  Pool,
  PoolMember,
  MerkleRootHistory,
  NetworkMetadata,
  SubgraphResponse,
  SubgraphClientConfig,
  PaginationOptions,
  SerializedPool,
} from "@workspace/data";

export {
  SubgraphClient,
  serializePool,
  deserializePool,
  formatBigIntValue,
} from "@workspace/data";

// Client types (keep the core-specific ones)
export type {
  PrepaidGasPaymasterConfig,
  PoolData,
  PoolFields,
  PoolMembershipInfo,
  GetPaymasterStubDataV7Parameters,
} from "./types.js";
