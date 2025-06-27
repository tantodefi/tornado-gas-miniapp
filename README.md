# Prepaid Gas Paymaster Monorepo

This monorepo contains a modular system for privacy-preserving, pool-based prepaid gas payments on Ethereum using Account Abstraction (ERC-4337) and zero-knowledge proofs. It is organized into a Next.js web app and several reusable packages.

## Apps

### `apps/web`

A Next.js web application that provides a user interface for:

- Managing prepaid gas credits
- Viewing and joining pools
- Interacting with the paymaster system
- Integrating with wallets and payment providers

## Packages

### `packages/core`

TypeScript SDK for interacting with the prepaid gas paymaster system. Provides:

- Paymaster client for generating paymaster data and proofs
- Utilities for encoding/decoding context and config
- Services for proof generation, Merkle root management, and gas estimation
- Types for pool, membership, and paymaster data

### `packages/data`

Data access layer for the subgraph. Provides:

- A client for querying pool, member, and root history data
- Utilities for serializing/deserializing subgraph data
- Types matching the subgraph schema

### `packages/ui`

Reusable React UI components for the app and packages, including:

- Buttons, cards, dialogs, inputs, labels, badges, and more
- Styled with Tailwind CSS and Radix UI primitives
- Designed for consistency and accessibility

### `packages/eslint-config`

Shared ESLint configuration for code quality and style across the monorepo.

### `packages/typescript-config`

Shared TypeScript configuration for consistent type checking and build settings.

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```
2. **Run the web app locally:**
   ```bash
   pnpm --filter web dev
   ```
3. **Build all packages:**
   ```bash
   pnpm build
   ```

## Contributing

- UI components should be added to `packages/ui` for reuse.
- Core logic and SDK code should go in `packages/core`.
- Data fetching and subgraph logic should go in `packages/data`.
- Use the shared ESLint and TypeScript configs for consistency.

---

For more details, see the README files in each package (if available) or explore the source code.
