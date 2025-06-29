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

// ✅ Base Mainnet with custom subgraph
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
import { PrepaidGasPaymaster, BASE_SEPOLIA_PRESET } from "@workspace/core";

// Custom configuration
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
const baseMainnet = PrepaidGasPaymaster.createForNetwork(8453);

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

### Network Utilities

```typescript
import {
  getNetworkPreset,
  getSupportedChainIds,
  isSupportedChainId,
} from "@workspace/core";

// Check if network is supported
if (isSupportedChainId(chainId)) {
  const preset = getNetworkPreset(chainId);
  console.log(`Network: ${preset.network.name}`);
}

// Get all supported networks
const supportedNetworks = getSupportedChainIds(); // [84532, 8453]
```

### Context Encoding

```typescript
import { encodePaymasterContext } from "@workspace/core";

// Create paymaster context for gas cards
const context = encodePaymasterContext(
  "0x...", // paymaster address
  "1", // pool ID
  "eyJ...", // semaphore identity (base64)
);
```

## Network Support

| Network      | Chain ID | Status         |
| ------------ | -------- | -------------- |
| Base Sepolia | 84532    | ✅ Active      |
| Base Mainnet | 8453     | 🚧 Coming Soon |

```typescript
import { BASE_SEPOLIA_PRESET, BASE_MAINNET_PRESET } from "@workspace/core";

console.log(BASE_SEPOLIA_PRESET.defaultSubgraphUrl);
console.log(BASE_SEPOLIA_PRESET.network.contracts.paymaster);
```

## Configuration

### Environment Variables

```bash
# Optional: Custom subgraph URL
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/your-subgraph

# Optional: Custom RPC URL
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

### TypeScript Types

```typescript
import type {
  PrepaidGasPaymasterConfig,
  NetworkConfig,
  NetworkPreset,
  PoolMembershipProof,
} from "@workspace/core";

const config: PrepaidGasPaymasterConfig = {
  subgraphUrl: "https://...",
  network: networkConfig,
  debug: true,
};
```

## Integration Examples

### Next.js App

```typescript
// lib/paymaster.ts
import { PrepaidGasPaymaster } from "@workspace/core";

export const paymaster = PrepaidGasPaymaster.createForNetwork(84532, {
  subgraphUrl: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
  debug: process.env.NODE_ENV === "development",
});
```

### React Hook

```typescript
import { PrepaidGasPaymaster } from "@workspace/core";
import { useMemo } from "react";

export function usePaymaster(chainId: number) {
  return useMemo(() => {
    return PrepaidGasPaymaster.createForNetwork(chainId, {
      debug: process.env.NODE_ENV === "development",
    });
  }, [chainId]);
}
```

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

## Error Handling

```typescript
import { PrepaidGasPaymaster, isSupportedChainId } from "@workspace/core";

try {
  // Validate network support
  if (!isSupportedChainId(chainId)) {
    throw new Error(`Unsupported network: ${chainId}`);
  }

  const paymaster = PrepaidGasPaymaster.createForNetwork(chainId);

  const data = await paymaster.getPaymasterData(params);
} catch (error) {
  if (error.message.includes("subgraph")) {
    console.error("Subgraph connection failed:", error);
  } else if (error.message.includes("proof")) {
    console.error("Zero-knowledge proof generation failed:", error);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## Migration Guide

### From v1.x to v2.x

```typescript
// ❌ Old way (v1.x)
const paymaster = new PrepaidGasPaymaster({
  subgraphUrl: "https://...",
  network: BASE_SEPOLIA_NETWORK, // Just basic network config
  // ... lots of manual setup
});

// ✅ New way (v2.x)
const paymaster = PrepaidGasPaymaster.createForNetwork(84532); // That's it!

// ✅ With custom options
const paymaster = PrepaidGasPaymaster.createForNetwork(84532, {
  subgraphUrl: "https://custom-subgraph.com",
  debug: true,
});
```

**Key improvements in v2.x:**

- 🚀 **90% less setup code** for common use cases
- 🎯 **Single factory method** instead of multiple network-specific methods
- 🏗️ **Built-in presets** with sensible defaults
- 🧹 **Cleaner API** with removed internal complexity
- 📦 **Smaller bundle size** through better tree-shaking

## Best Practices

### 1. Use Factory Methods

```typescript
// ✅ Recommended
const paymaster = PrepaidGasPaymaster.createForNetwork(84532);

// ❌ Avoid unless you need custom network config
const paymaster = new PrepaidGasPaymaster({
  /* lots of config */
});
```

### 2. Handle Network Validation

```typescript
import { isSupportedChainId } from "@workspace/core";

// ✅ Always validate before creating
if (isSupportedChainId(userChainId)) {
  const paymaster = PrepaidGasPaymaster.createForNetwork(userChainId);
}
```

### 3. Environment-Based Configuration

```typescript
// ✅ Good for different environments
const paymaster = PrepaidGasPaymaster.createForNetwork(84532, {
  subgraphUrl: process.env.SUBGRAPH_URL,
  debug: process.env.NODE_ENV === "development",
});
```

### 4. Error Boundaries

```typescript
// ✅ Wrap in try-catch for production
try {
  const result = await paymaster.getPaymasterData(params);
} catch (error) {
  // Handle gracefully
  console.error("Paymaster failed:", error.message);
  // Fallback to regular transaction
}
```

## Troubleshooting

### Common Issues

**"Unsupported network" error:**

```typescript
// Check supported networks
import { getSupportedChainIds } from "@workspace/core";
console.log("Supported:", getSupportedChainIds()); // [84532, 8453]
```

**"No subgraph URL" error:**

```typescript
// Provide custom subgraph URL
const paymaster = PrepaidGasPaymaster.createForNetwork(chainId, {
  subgraphUrl: "https://your-subgraph-endpoint.com",
});
```

**"Invalid identity" error:**

```typescript
// Ensure identity is base64 encoded Semaphore identity
const identity = Identity.generate().export();
const context = encodePaymasterContext(paymasterAddr, poolId, identity);
```

## Support

- **Documentation**: [GitHub Wiki](https://github.com/your-org/prepaid-gas-paymaster)
- **Issues**: [GitHub Issues](https://github.com/your-org/prepaid-gas-paymaster/issues)
- **Discord**: [Join our community](https://discord.gg/your-discord)

## License

MIT License - see [LICENSE](./LICENSE) for details.
