# PrepaidGasPaymaster SDK

A TypeScript SDK for integrating with privacy-preserving, pool-based prepaid gas payments using Account Abstraction (ERC-4337) and zero-knowledge proofs.

## Installation

```bash
npm install @workspace/core
# or
pnpm add @workspace/core
```

## Quick Start

### Basic Usage

```typescript
import { PrepaidGasPaymaster, BASE_SEPOLIA_NETWORK } from "@workspace/core";

// Create paymaster client with explicit configuration
const paymaster = new PrepaidGasPaymaster({
  // Required: Your deployed subgraph URL
  subgraphUrl: "https://api.studio.thegraph.com/query/your-deployment-id/your-subgraph/version",
  
  // Required: Network configuration
  network: BASE_SEPOLIA_NETWORK,
  
  // Optional: Custom RPC URL
  rpcUrl: "https://sepolia.base.org",
  
  // Optional: Enable debug logging
  debug: true,
});
```

### Custom Network Configuration

```typescript
import { PrepaidGasPaymaster } from "@workspace/core";

const paymaster = new PrepaidGasPaymaster({
  subgraphUrl: "https://your-subgraph-endpoint.com",
  network: {
    name: "Custom Network",
    chainId: 12345,
    chainName: "Custom Chain",
    networkName: "Testnet",
    contracts: {
      paymaster: "0xYourPaymasterAddress",
      verifier: "0xYourVerifierAddress", // Optional
    },
  },
});
```

### Available Network Presets

```typescript
import { 
  BASE_SEPOLIA_NETWORK, 
  BASE_MAINNET_NETWORK,
  NETWORKS,
  getNetworkByChainId 
} from "@workspace/core";

// Use predefined networks
const sepoliaPaymaster = new PrepaidGasPaymaster({
  subgraphUrl: "your-subgraph-url",
  network: BASE_SEPOLIA_NETWORK,
});

// Or find by chain ID
const network = getNetworkByChainId(84532); // Returns BASE_SEPOLIA_NETWORK
```

## Configuration Requirements

### Required Parameters

1. **`subgraphUrl`** (string): URL of your deployed subgraph endpoint
   - Must be a valid URL
   - Required for querying pool and member data

2. **`network`** (NetworkConfig): Network configuration object
   - `name`: Network name (e.g., "Base")
   - `chainId`: Chain ID number (e.g., 84532)
   - `chainName`: Full chain name (e.g., "Base Sepolia") 
   - `networkName`: Network type (e.g., "Sepolia")
   - `contracts.paymaster`: Paymaster contract address (required)
   - `contracts.verifier`: Verifier contract address (optional)

### Optional Parameters

- **`rpcUrl`** (string): Custom RPC endpoint URL
- **`debug`** (boolean): Enable debug logging
- **`timeout`** (number): Request timeout in milliseconds

## Usage Examples

### Demo Application Setup

```typescript
// apps/demo/hooks/use-smart-account-creation.ts
import { PrepaidGasPaymaster, BASE_SEPOLIA_NETWORK } from "@workspace/core";

const paymasterClient = new PrepaidGasPaymaster({
  subgraphUrl: process.env.NEXT_PUBLIC_SUBGRAPH_URL!,
  network: BASE_SEPOLIA_NETWORK,
  debug: process.env.NODE_ENV === "development",
});
```

### Web Application Setup

```typescript
// apps/web/lib/services/paymaster.ts
import { PrepaidGasPaymaster, BASE_SEPOLIA_NETWORK } from "@workspace/core";

export function createPaymasterClient(subgraphUrl: string) {
  return new PrepaidGasPaymaster({
    subgraphUrl,
    network: BASE_SEPOLIA_NETWORK,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
  });
}
```

## Environment Variables

Your application will need to provide the subgraph URL. Set this in your environment:

```bash
# Required: Your subgraph endpoint
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/your-deployment-id/your-subgraph/version

# Optional: Custom RPC URL
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

## Migration from Previous Versions

If you were using the old configuration format:

```typescript
// ❌ Old format (no longer supported)
const paymaster = new PrepaidGasPaymaster({
  network: "base-sepolia", // String-based lookup
});

// ✅ New format (explicit configuration)
const paymaster = new PrepaidGasPaymaster({
  subgraphUrl: "https://your-subgraph-url.com",
  network: BASE_SEPOLIA_NETWORK,
});
```

## Error Handling

The SDK provides clear error messages for configuration issues:

```typescript
try {
  const paymaster = new PrepaidGasPaymaster({
    subgraphUrl: "", // ❌ Empty URL
    network: BASE_SEPOLIA_NETWORK,
  });
} catch (error) {
  console.error(error.message);
  // "subgraphUrl is required and must be a valid URL"
}
```

## Network Configuration Validation

```typescript
import { validateNetworkConfig } from "@workspace/core";

const result = validateNetworkConfig(myNetworkConfig);
if (!result.isValid) {
  console.error("Network configuration errors:", result.errors);
}
```

## Best Practices

1. **Always validate your configuration** before deploying to production
2. **Use environment variables** for sensitive URLs and addresses
3. **Enable debug logging** during development
4. **Use the provided network constants** for common networks
5. **Validate subgraph connectivity** before using the paymaster

## Support

For issues and questions:
- Check the configuration validation errors
- Ensure your subgraph is deployed and accessible
- Verify all required contract addresses are correct
- Enable debug logging to see detailed information