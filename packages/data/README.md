# @workspace/data

A TypeScript data access layer for the prepaid gas paymaster subgraph. Provides type-safe querying, network configuration, and data serialization utilities for blockchain data.

## Features

- 🔍 **Type-safe subgraph queries** with fluent API
- 🌐 **Network configuration** with built-in presets  
- 🔄 **BigInt serialization** for JSON compatibility
- 📦 **Environment agnostic** - no direct env dependencies
- 🏗️ **Query builder** for complex data operations
- 🎯 **Field selection** for optimized queries
- ✅ **TypeScript support** with comprehensive types

## Installation

```bash
npm install @workspace/data
# or
pnpm add @workspace/data
```

## Quick Start

### Simple Constructor (Recommended)

```typescript
import { SubgraphClient } from '@workspace/data';

// Create client for Base Sepolia (uses built-in subgraph URL)
const client = new SubgraphClient(84532);

// Create client with custom subgraph URL
const client = new SubgraphClient(84532, {
  subgraphUrl: 'https://your-mainnet-subgraph.com'
});

// Create client with timeout
const client = new SubgraphClient(84532, {
  subgraphUrl: 'https://your-subgraph.com',
  timeout: 10000
});
```

### Factory Method (Alternative)

```typescript
import { SubgraphClient } from '@workspace/data';

// Factory method - equivalent to constructor
const client = SubgraphClient.createForNetwork(84532);

// With options
const client = SubgraphClient.createForNetwork(84532, {
  subgraphUrl: 'https://your-mainnet-subgraph.com'
});
```

## Query Builder API

### Fluent Pool Queries

```typescript
// Get pools with specific field selection
const poolsBasicInfo = await client
  .query()
  .pools()
  .select('poolId', 'joiningFee', 'memberCount')
  .execute();
```

### Advanced Queries

```typescript
// Complex paymaster query
const paymasters = await client
  .query()
  .paymasters()
  .byType("GasLimited")
  .withMinRevenue("1000000000000000000")
  .orderByRevenue()
  .limit(10)
  .execute();

// User operations with filtering
const userOps = await client
  .query()
  .userOperations()
  .byPaymaster("0x3BEeC075aC5A77fFE0F9ee4bbb3DCBd07fA93fbf")
  .bySender("0x456...")
  .orderByTimestamp("desc")
  .limit(50)
  .execute();

// Pool members query
const members = await client
  .query()
  .poolMembers()
  .byPool("123")
  .withNullifierUsed()
  .orderByJoinDate()
  .execute();
```

## Data Serialization

The package handles BigInt serialization automatically for JSON compatibility:

```typescript
import { serializePool, deserializePool } from '@workspace/data';

// Serialize for JSON (BigInt → string)
const serializedPool = serializePool(pool);
const json = JSON.stringify(serializedPool);

// Deserialize from JSON (string → BigInt)
const parsed = JSON.parse(json);
const pool = deserializePool(parsed);

// Individual field utilities
import { safeBigIntParse, formatBigIntValue } from '@workspace/data';

const amount = safeBigIntParse('1000000000000000000');
const formatted = formatBigIntValue(amount, 18, 4); // "1.0000"
```

## Network Configuration

### Built-in Network Presets

```typescript
import { 
  BASE_SEPOLIA_PRESET,
  NETWORK_PRESETS,
  getSupportedChainIds,
  isSupportedChainId 
} from '@workspace/data';

// Check supported networks
const supportedChains = getSupportedChainIds(); // [84532, 8453]
const isSupported = isSupportedChainId(84532); // true

// Get preset by chain ID
const preset = NETWORK_PRESETS[84532]; // BASE_SEPOLIA_PRESET

// Access network configuration
const network = BASE_SEPOLIA_PRESET.network;
console.log(network.chainId); // 84532
console.log(network.contracts.paymasters.gasLimited); // Contract address
```

### Static Utility Methods

```typescript
// Check if network is supported
if (SubgraphClient.isNetworkSupported(84532)) {
  const client = new SubgraphClient(84532);
}

// Get all supported networks
const networks = SubgraphClient.getSupportedNetworks();
console.log(networks.map(n => n.network.chainName)); // ["Base Sepolia", ...]

// Get network preset
const preset = SubgraphClient.getNetworkPreset(84532);
console.log(preset.network.chainName); // "Base Sepolia"
```

## Error Handling

```typescript
import { getUnsupportedNetworkError } from '@workspace/data';

try {
  const client = new SubgraphClient(999999);
} catch (error) {
  console.error(error.message);
  // "Unsupported network with chainId: 999999. Supported networks: 84532, 8453"
}

// Handle query errors
try {
  const pools = await client.query().pools().execute();
} catch (error) {
  console.error('Query failed:', error.message);
}
```

## TypeScript Support

### Core Types

```typescript
import type {
  // Subgraph entity types
  Pool,
  PoolMember,
  MerkleRoot,
  UserOperation,
  
  // Serialized types (for JSON)
  SerializedPool,
  SerializedPoolMember,
  SerializedUserOperation,
  
  // Client types
  ClientOptions,
  PaginationOptions,
  
  // Network types
  NetworkConfig,
  NetworkPreset,
  
  // Query types
  QueryConfig,
  PoolFields,
  PoolMemberFields,
  PoolWhereInput,
  
  // Response types
  SubgraphResponse,
  NetworkMetadata
} from '@workspace/data';
```

### Query Builder Types

```typescript
// Type-safe field selection
const pools = await client
  .query()
  .pools()
  .select('poolId', 'joiningFee', 'memberCount') // TypeScript autocomplete
  .execute();

// Type-safe where conditions
const expensivePools = await client
  .query()
  .pools()
  .where({
    joiningFee: { gte: '1000000000000000000' },
    memberCount: { gte: '10' }
  })
  .execute();
```

## API Reference

### SubgraphClient

| Method | Description | Returns |
|--------|-------------|---------|
| `new SubgraphClient(chainId, options?)` | Create client for supported network | `SubgraphClient` |
| `SubgraphClient.createForNetwork(chainId, options?)` | Factory method (alternative) | `SubgraphClient` |
| `SubgraphClient.isNetworkSupported(chainId)` | Check network support | `boolean` |
| `SubgraphClient.getSupportedNetworks()` | Get all network presets | `NetworkPreset[]` |
| `SubgraphClient.getNetworkPreset(chainId)` | Get network preset | `NetworkPreset` |
| `query()` | Get fluent query builder | `QueryBuilder` |
| `executeQuery<T>(query, variables?)` | Execute raw GraphQL query | `Promise<T>` |
| `executeQueries<T>(queries)` | Execute multiple queries | `Promise<T[]>` |
| `testConnection()` | Test subgraph connection | `Promise<boolean>` |
| `getSubgraphMetadata()` | Get subgraph metadata | `Promise<SubgraphMetadata>` |
| `getHealthStatus()` | Get subgraph health | `Promise<HealthStatus>` |
| `switchNetwork(chainId, options?)` | Create client for different network | `SubgraphClient` |

### QueryBuilder

| Method | Description | Returns |
|--------|-------------|---------|
| `pools()` | Start pool query | `PoolQueryBuilder` |
| `poolMembers()` | Start member query | `PoolMemberQueryBuilder` |
| `paymasters()` | Start paymaster query | `PaymasterContractQueryBuilder` |
| `userOperations()` | Start user operation query | `UserOperationQueryBuilder` |
| `merkleRoots()` | Start merkle root query | `MerkleRootQueryBuilder` |

## Environment Configuration

The package is environment-agnostic and receives all configuration via parameters:

```typescript
// ✅ Correct - configuration via parameters
const client = new SubgraphClient(84532, {
  subgraphUrl: config.subgraphUrl,  // From your app config
  timeout: 10000,                   // Optional timeout
});

// ❌ Incorrect - package doesn't read env vars directly
// Package doesn't do: process.env.SUBGRAPH_URL
```

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

For issues and questions:
- Check the [API documentation](#api-reference)
- Review [TypeScript types](#typescript-support)
- See [error handling examples](#error-handling)