/**
 * Network configurations for supported blockchain networks
 *
 * This file contains the basic network configuration data including
 * chain IDs, contract addresses, and network metadata.
 * Updated to support multiple paymaster contracts per network.
 */

/**
 * Paymaster contract configuration
 */
export interface PaymasterContractConfig {
  /** Contract address */
  address: `0x${string}`;
  /** Block number where contract was deployed */
  startBlock: number;
  /** Contract type */
  type: "GasLimited" | "OneTimeUse";
}

/**
 * Network configuration interface
 * Updated to support multiple paymaster contracts
 */
export interface NetworkConfig {
  /** Network name (e.g., "Base Sepolia") */
  name: string;
  /** Chain ID (e.g., 84532 for Base Sepolia) */
  chainId: number;
  /** Chain name (e.g., "base-sepolia") */
  chainName: string;
  /** Network name (e.g., "base-sepolia") */
  networkName: string;
  /** Contract addresses for this network */
  contracts: {
    /** Map of paymaster contracts by type */
    paymasters: {
      gasLimited?: PaymasterContractConfig;
      oneTimeUse?: PaymasterContractConfig;
    };
    /** Optional verifier contract address */
    verifier?: `0x${string}`;
  };
}

/**
 * Base Sepolia network configuration
 * Updated with actual contract addresses from networks.json
 */
export const BASE_SEPOLIA_NETWORK: NetworkConfig = {
  name: "Base Sepolia",
  chainId: 84532,
  chainName: "base-sepolia",
  networkName: "base-sepolia",
  contracts: {
    paymasters: {
      gasLimited: {
        address: "0x3BEeC075aC5A77fFE0F9ee4bbb3DCBd07fA93fbf",
        startBlock: 27904637,
        type: "GasLimited",
      },
      oneTimeUse: {
        address: "0x243A735115F34BD5c0F23a33a444a8d26e31E2E7",
        startBlock: 27904638,
        type: "OneTimeUse",
      },
    },
    // verifier: "0x...", // Add when available
  },
};

/**
 * Utility functions for working with network configurations
 */

/**
 * Get all paymaster contracts for a network
 *
 * @param network - Network configuration
 * @returns Array of all paymaster contracts
 */
export function getAllPaymasterContracts(
  network: NetworkConfig,
): PaymasterContractConfig[] {
  const contracts: PaymasterContractConfig[] = [];

  if (network.contracts.paymasters.gasLimited) {
    contracts.push(network.contracts.paymasters.gasLimited);
  }

  if (network.contracts.paymasters.oneTimeUse) {
    contracts.push(network.contracts.paymasters.oneTimeUse);
  }

  return contracts;
}

/**
 * Get paymaster contract by type
 *
 * @param network - Network configuration
 * @param type - Paymaster type
 * @returns Paymaster contract config or undefined
 */
export function getPaymasterByType(
  network: NetworkConfig,
  type: "GasLimited" | "OneTimeUse",
): PaymasterContractConfig | undefined {
  const key = type === "GasLimited" ? "gasLimited" : "oneTimeUse";
  return network.contracts.paymasters[key];
}

/**
 * Check if network has a specific paymaster type
 *
 * @param network - Network configuration
 * @param type - Paymaster type to check
 * @returns True if network has the specified paymaster type
 */
export function hasPaymasterType(
  network: NetworkConfig,
  type: "GasLimited" | "OneTimeUse",
): boolean {
  return getPaymasterByType(network, type) !== undefined;
}

/**
 * Get paymaster contract by address
 *
 * @param network - Network configuration
 * @param address - Contract address
 * @returns Paymaster contract config or undefined
 */
export function getPaymasterByAddress(
  network: NetworkConfig,
  address: string,
): PaymasterContractConfig | undefined {
  const contracts = getAllPaymasterContracts(network);
  return contracts.find(
    (contract) => contract.address.toLowerCase() === address.toLowerCase(),
  );
}

/**
 * Get the default paymaster for a network
 * Returns GasLimited if available, otherwise OneTimeUse
 *
 * @param network - Network configuration
 * @returns Default paymaster contract or undefined
 */
export function getDefaultPaymaster(
  network: NetworkConfig,
): PaymasterContractConfig | undefined {
  return (
    getPaymasterByType(network, "GasLimited") ||
    getPaymasterByType(network, "OneTimeUse")
  );
}

/**
 * Validate network configuration
 *
 * @param network - Network configuration to validate
 * @returns Validation result with errors if any
 */
export function validateNetworkConfig(network: NetworkConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Basic validation
  if (!network.name?.trim()) {
    errors.push("Network name is required");
  }

  if (!network.chainId || network.chainId <= 0) {
    errors.push("Valid chain ID is required");
  }

  if (!network.chainName?.trim()) {
    errors.push("Chain name is required");
  }

  if (!network.networkName?.trim()) {
    errors.push("Network name is required");
  }

  // Contract validation
  if (!network.contracts) {
    errors.push("Contracts configuration is required");
  } else {
    const contracts = getAllPaymasterContracts(network);

    if (contracts.length === 0) {
      errors.push("At least one paymaster contract is required");
    }

    // Validate each contract
    contracts.forEach((contract, index) => {
      if (!contract.address || !contract.address.startsWith("0x")) {
        errors.push(`Paymaster ${index + 1}: Invalid contract address`);
      }

      if (!contract.startBlock || contract.startBlock < 0) {
        errors.push(`Paymaster ${index + 1}: Invalid start block`);
      }

      if (
        !contract.type ||
        !["GasLimited", "OneTimeUse"].includes(contract.type)
      ) {
        errors.push(`Paymaster ${index + 1}: Invalid contract type`);
      }
    });

    // Check for duplicate addresses
    const addresses = contracts.map((c) => c.address.toLowerCase());
    const uniqueAddresses = new Set(addresses);
    if (addresses.length !== uniqueAddresses.size) {
      errors.push("Duplicate paymaster contract addresses found");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
