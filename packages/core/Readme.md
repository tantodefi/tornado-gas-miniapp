# PrepaidGasPaymaster SDK

A TypeScript SDK for privacy-preserving, pool-based prepaid gas payments using Account Abstraction (ERC-4337) and zero-knowledge proofs.

## Features

- 🔐 **Privacy-First**: Zero-knowledge proofs via Semaphore protocol
- ⛽ **Gasless Transactions**: ERC-4337 Account Abstraction support
- 🏊 **Pool-Based**: Join pools for anonymous gas payments
- 🚀 **Developer-Friendly**: Simple API with smart defaults
- 🌐 **Multi-Network**: Support for Base Sepolia and Base Mainnet
- 📦 **Lightweight**: Minimal dependencies, tree-shakeable

## Installation

```bash
npm install @workspace/core
# or
pnpm add @workspace/core
```

## Quick Start

### Simple Setup (Recommended)

```typescript
import { PrepaidGasPaymaster } from "@workspace/core";

// ✅ One-line setup for Base Sepolia
const paymaster = PrepaidGasPaymaster.createForNetwork(84532);

// ✅ Base Mainnet with custom subgraph (required - no default available)
const paymaster = PrepaidGasPaymaster.createForNetwork(8453, {
  subgraphUrl: "https://your-mainnet-subgraph.com",
});

// ✅ With debug logging
const paymaster = PrepaidGasPaymaster.createForNetwork(84532, {
  debug: true,
});
```

### Advanced Setup

```typescript
import { PrepaidGasPaymaster } from "@workspace/core";
import { BASE_SEPOLIA_PRESET } from "@workspace/data";

// Custom configuration using network presets
const paymaster = new PrepaidGasPaymaster({
  subgraphUrl: "https://your-subgraph-endpoint.com",
  network: BASE_SEPOLIA_PRESET.network,
  rpcUrl: "https://custom-rpc.com",
  debug: true,
  timeout: 10000,
});
```

## API Reference

### Factory Methods

#### `PrepaidGasPaymaster.createForNetwork(chainId, options?)`

Create a paymaster instance for any supported network.

```typescript
// Supported networks
const baseSepolia = PrepaidGasPaymaster.createForNetwork(84532);

// Base Mainnet requires custom subgraph URL
const baseMainnet = PrepaidGasPaymaster.createForNetwork(8453, {
  subgraphUrl: "https://your-mainnet-subgraph.com", // Required
});

// With options
const paymaster = PrepaidGasPaymaster.createForNetwork(84532, {
  subgraphUrl?: string;    // Custom subgraph URL
  debug?: boolean;         // Enable debug logging
  rpcUrl?: string;         // Custom RPC endpoint
  timeout?: number;        // Request timeout (ms)
});
```

### Core Methods

#### `getPaymasterStubData(parameters)`

Generate stub paymaster data for gas estimation.

```typescript
const stubData = await paymaster.getPaymasterStubData({
  sender: "0x...",
  callData: "0x...",
  context: encodedContext,
  chainId: 84532,
  entryPointAddress: "0x...",
});
```

#### `getPaymasterData(parameters)`

Generate real paymaster data with zero-knowledge proof.

```typescript
const paymasterData = await paymaster.getPaymasterData({
  sender: "0x...",
  callData: "0x...",
  context: encodedContext,
  // ... other UserOperation fields
});
```

### Utility Methods

#### `getSubgraphClient()`

Get the configured subgraph client instance.

```typescript
const subgraphClient = paymaster.getSubgraphClient();
const pools = await subgraphClient.query().pools().execute();
```

#### `getNetworkInfo()`

Get current network configuration information.

```typescript
const networkInfo = paymaster.getNetworkInfo();
console.log(networkInfo.network.chainId); // 84532
```

## Network Support

| Network      | Chain ID | Status                                  |
| ------------ | -------- | --------------------------------------- |
| Base Sepolia | 84532    | ✅ Active (default subgraph configured) |
| Base Mainnet | 8453     | ⚠️ Supported (requires custom subgraph) |

## Context Encoding

Use the encoding utilities to prepare context for paymaster operations:

```typescript
import { encodePaymasterContext, parsePaymasterContext } from "@workspace/core";

// Encode context for paymaster operations
const context = encodePaymasterContext({
  paymasterAddress: "0x...",
  poolId: 123n,
  identity: identityString,
});

// Parse context from paymaster data
const parsed = parsePaymasterContext(context);
console.log(parsed.poolId); // 123n
```

## Error Handling

The SDK provides detailed error messages for common issues:

```typescript
try {
  const paymaster = PrepaidGasPaymaster.createForNetwork(999999);
} catch (error) {
  console.error(error.message);
  // "Unsupported network with chainId: 999999. Supported networks: 84532, 8453"
}

try {
  const paymaster = PrepaidGasPaymaster.createForNetwork(8453);
} catch (error) {
  console.error(error.message);
  // "No subgraph URL available for network Base (chainId: 8453). Please provide one in options.subgraphUrl"
}
```

## Configuration

The core package is environment-agnostic and receives all configuration through constructor parameters or factory method options. It does not directly read environment variables.

### Configuration Options

```typescript
interface PrepaidGasPaymasterConfig {
  subgraphUrl: string; // Required: Subgraph endpoint URL
  network: NetworkConfig; // Required: Network configuration
  rpcUrl?: string; // Optional: Custom RPC endpoint
  debug?: boolean; // Optional: Enable debug logging
  timeout?: number; // Optional: Request timeout in ms
}
```

### Runtime Configuration

Applications using the core package can pass configuration from any source:

```typescript
// From environment variables (in your app)
const paymaster = PrepaidGasPaymaster.createForNetwork(84532, {
  subgraphUrl: process.env.SUBGRAPH_URL,
  debug: process.env.NODE_ENV === "development",
});

// From configuration files (in your app)
const paymaster = PrepaidGasPaymaster.createForNetwork(84532, {
  subgraphUrl: config.subgraph.url,
  rpcUrl: config.rpc.baseSepoliaUrl,
});

// Hardcoded values
const paymaster = PrepaidGasPaymaster.createForNetwork(84532, {
  subgraphUrl: "https://api.studio.thegraph.com/query/your-subgraph",
  debug: true,
});
```

## Integration Examples

### Smart Account Integration

```typescript
import { createSmartAccountClient } from "permissionless";
import { PrepaidGasPaymaster } from "@workspace/core";

const paymaster = PrepaidGasPaymaster.createForNetwork(84532);

const smartAccount = await createSmartAccountClient({
  // ... account config
  paymaster: {
    getPaymasterStubData: paymaster.getPaymasterStubData.bind(paymaster),
    getPaymasterData: paymaster.getPaymasterData.bind(paymaster),
  },
});
```

### Server-Side Usage

```typescript
import { PrepaidGasPaymaster } from "@workspace/core";

// Server-side configuration
const paymaster = PrepaidGasPaymaster.createForNetwork(84532, {
  subgraphUrl: process.env.SUBGRAPH_URL,
  rpcUrl: process.env.RPC_URL,
  debug: process.env.NODE_ENV === "development",
});
```

### Browser Usage

```typescript
import { PrepaidGasPaymaster } from "@workspace/core";

// Browser-side configuration (using public env vars)
const paymaster = PrepaidGasPaymaster.createForNetwork(84532, {
  debug: true, // Enable for development
});
```

## Network Presets

For advanced use cases, you can import network presets from the data package:

```typescript
import { PrepaidGasPaymaster } from "@workspace/core";
import {
  BASE_SEPOLIA_PRESET,
  BASE_MAINNET_PRESET,
  getSupportedChainIds,
  isSupportedChainId,
} from "@workspace/data";

// Check network support
if (isSupportedChainId(chainId)) {
  const paymaster = PrepaidGasPaymaster.createForNetwork(chainId);
}

// Get all supported networks
const supportedChains = getSupportedChainIds(); // [84532, 8453]

// Use preset directly
const paymaster = new PrepaidGasPaymaster({
  subgraphUrl: "https://custom-subgraph.com",
  network: BASE_SEPOLIA_PRESET.network,
});
```

## TypeScript Support

The SDK is fully typed with comprehensive TypeScript support:

```typescript
import type {
  PrepaidGasPaymasterConfig,
  ParsedPaymasterContext,
  GetPaymasterStubDataV7Parameters,
} from "@workspace/core";

// Type-safe configuration
const config: PrepaidGasPaymasterConfig = {
  subgraphUrl: "https://...",
  network: BASE_SEPOLIA_PRESET.network,
  debug: true,
};
```

## License

MIT License - see [LICENSE](./LICENSE) for details.
