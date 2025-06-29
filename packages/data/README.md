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

### Using Network Presets (Recommended)

```typescript
import { SubgraphClient } from '@workspace/data';

// Create client for Base Sepolia (uses built-in subgraph URL)
const client = SubgraphClient.createForNetwork(84532);

// Create client for Base Mainnet (requires custom subgraph URL)
const client = SubgraphClient.createForNetwork(8453, {
  subgraphUrl: 'https://your-mainnet-subgraph.com'
});
```

### Custom Configuration

```typescript
import { SubgraphClient, BASE_SEPOLIA_PRESET } from '@workspace/data';

const client = new SubgraphClient({
  subgraphUrl: 'https://api.studio.thegraph.com/query/your-subgraph',
  network: BASE_SEPOLIA_PRESET.network,
  timeout: 10000 // optional
});
```

## Query Builder API

### Fluent Pool Queries

```typescript
// Get popular pools with many members
const popularPools = await client
  .query()
  .pools()
  .withMinMembers(10)
  .orderByPopularity()
  .limit(20)
  .execute();

// Find affordable pools
const cheapPools = await client
  .query()
  .pools()
  .maxJoiningFee('500000000000000000') // 0.5 ETH in wei
  .orderByAffordability()
  .limit(15)
  .execute();

// Get pools with specific field selection
const poolsBasicInfo = await client
  .query()
  .pools()
  .select('poolId', 'joiningFee', 'membersCount')
  .withMinMembers(5)
  .execute();
```

### Member Queries

```typescript
// Get active members of a pool
const members = await client
  .query()
  .members()
  .inPool('1')
  .activeOnly()
  .orderByNewestJoined()
  .limit(50)
  .execute();

// Find pools for a specific identity
const userPools = await client
  .query()
  .findPoolsByIdentity('0x123...');
```

### Advanced Queries

```typescript
// Get pools with member data included
const poolsWithMembers = await client
  .query()
  .pools()
  .byId('1')
  .withMembers(50)
  .execute();

// Get members with pool information
const membersWithPool = await client
  .query()
  .members()
  .inPool('1')
  .withPool()
  .execute();
```

## Convenience Methods

```typescript
const queryBuilder = client.query();

// Get all pools
const allPools = await queryBuilder.getAllPools(100);

// Get popular pools (min 10 members)
const popular = await queryBuilder.getPopularPools(10, 20);

// Get affordable pools (max 1 ETH joining fee)
const affordable = await queryBuilder.getAffordablePools('1000000000000000000', 15);

// Get recent pools
const recent = await queryBuilder.getRecentPools(10);

// Get pool statistics
const stats = await queryBuilder.getPoolStats();

// Search pools with complex criteria
const searchResults = await queryBuilder.searchPools({
  maxJoiningFee: '500000000000000000',
  minMembers: 5,
  maxMembers: 100,
  orderBy: 'popularity',
  limit: 25
});
```

## Direct SubgraphClient Methods

```typescript
// Get pools where identity is a member
const { data: poolMemberships } = await client.getPoolsByIdentity(
  '0x123...',
  { first: 10 }
);

// Get pool members
const { data: members } = await client.getPoolMembers('1', { first: 100 });

// Get pool details with members
const { data: poolDetails } = await client.getPoolDetails('1', true, 50);

// Get valid root indices
const validRoots = await client.getValidRootIndices('1');

// Get root history
const { data: rootHistory } = await client.getPoolRootHistory('1');
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
  BASE_MAINNET_PRESET,
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
console.log(network.contracts.paymaster); // Contract address
```

### Network Preset Properties

```typescript
interface NetworkPreset {
  network: NetworkConfig;
  defaultSubgraphUrl: string;
  defaultRpcUrl?: string;
  description: string;
}

interface NetworkConfig {
  name: string;          // "Base"
  chainId: number;       // 84532
  chainName: string;     // "Base Sepolia"
  networkName: string;   // "Sepolia"
  contracts: {
    paymaster: `0x${string}`;
    verifier?: `0x${string}`;
  };
}
```

## Error Handling

```typescript
import { getUnsupportedNetworkError } from '@workspace/data';

try {
  const client = SubgraphClient.createForNetwork(999999);
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
  MerkleRootHistory,
  
  // Serialized types (for JSON)
  SerializedPool,
  SerializedPoolMember,
  SerializedMerkleRootHistory,
  
  // Network types
  NetworkConfig,
  NetworkPreset,
  
  // Query types
  QueryConfig,
  PoolFields,
  PoolMemberFields,
  PoolWhereInput,
  PoolMemberWhereInput,
  
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
  .select('poolId', 'joiningFee', 'membersCount') // TypeScript autocomplete
  .execute();

// Type-safe where conditions
const expensivePools = await client
  .query()
  .pools()
  .where({
    joiningFee: { gte: '1000000000000000000' },
    membersCount: { gte: '10' }
  })
  .execute();
```

## API Reference

### SubgraphClient

| Method | Description | Returns |
|--------|-------------|---------|
| `createForNetwork(chainId, options?)` | Create client for supported network | `SubgraphClient` |
| `query()` | Get fluent query builder | `QueryBuilder` |
| `getPoolsByIdentity(commitment, options?)` | Get pools for identity | `Promise<SubgraphResponse<Array<{member, pool}>>>` |
| `getPoolMembers(poolId, options?)` | Get pool members | `Promise<SubgraphResponse<PoolMember[]>>` |
| `getPoolDetails(poolId, includeMembers?, memberLimit?)` | Get pool details | `Promise<SubgraphResponse<Pool & {members, rootHistory}>>` |
| `getValidRootIndices(poolId)` | Get valid merkle roots | `Promise<RootHistoryItem[]>` |
| `getNetworkMetadata()` | Get network info | `NetworkMetadata` |

### QueryBuilder

| Method | Description | Returns |
|--------|-------------|---------|
| `pools()` | Start pool query | `PoolQueryBuilder` |
| `members()` | Start member query | `PoolMemberQueryBuilder` |
| `getAllPools(limit?)` | Get all pools | `Promise<Pool[]>` |
| `getPopularPools(minMembers?, limit?)` | Get popular pools | `Promise<Pool[]>` |
| `getAffordablePools(maxFee?, limit?)` | Get affordable pools | `Promise<Pool[]>` |
| `getRecentPools(limit?)` | Get recent pools | `Promise<Pool[]>` |
| `getPoolStats()` | Get pool statistics | `Promise<PoolStats>` |
| `findPoolsByIdentity(commitment)` | Find user's pools | `Promise<Array<{member, pool}>>` |

## Environment Configuration

The package is environment-agnostic and receives all configuration via parameters:

```typescript
// ✅ Correct - configuration via parameters
const client = new SubgraphClient({
  subgraphUrl: config.subgraphUrl,  // From your app config
  network: networkConfig,           // Network preset or custom
});

// ❌ Incorrect - package doesn't read env vars directly
// Package doesn't do: process.env.SUBGRAPH_URL
```

## Migration from Direct Queries

### Before (v1.x)

```typescript
const response = await client.getPoolsByIdentity(commitment);
const pools = response.data.map(item => item.pool);
```

### After (v2.x)

```typescript
// More flexible and type-safe
const pools = await client
  .query()
  .findPoolsByIdentity(commitment)
  .map(item => item.pool);

// Or with fluent API
const popularUserPools = await client
  .query()
  .pools()
  .withMinMembers(10)
  .execute();
```

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

For issues and questions:
- Check the [API documentation](#api-reference)
- Review [TypeScript types](#typescript-support)
- See [error handling examples](#error-handling)