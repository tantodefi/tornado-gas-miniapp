//file:prepaid-gas-website/apps/web/lib/services/client-factory.ts
import { SubgraphClient } from "@workspace/data";
import { NETWORK_CONFIG, getDefaultNetworkConfig } from "@/constants/network";

/**
 * Simplified factory for creating and managing SubgraphClient instances
 * Network information is now included in data package types by default
 */
class ClientFactory {
  private static subgraphClient: SubgraphClient | null = null;

  /**
   * Get or create SubgraphClient instance using default network configuration
   */
  static getSubgraphClient(): SubgraphClient {
    if (!this.subgraphClient) {
      const subgraphUrl = process.env.SUBGRAPH_URL;

      if (!subgraphUrl) {
        throw new Error("SUBGRAPH_URL environment variable is required");
      }

      // Use factory method with default network configuration
      this.subgraphClient = SubgraphClient.createForNetwork(
        NETWORK_CONFIG.DEFAULT_CHAIN_ID,
        {
          subgraphUrl,
        },
      );
    }

    return this.subgraphClient;
  }

  /**
   * Create SubgraphClient for specific chain ID (useful for multi-network apps)
   */
  static createClientForNetwork(
    chainId: number,
    subgraphUrl?: string,
  ): SubgraphClient {
    const url = subgraphUrl || process.env.SUBGRAPH_URL;

    if (!url) {
      throw new Error("SUBGRAPH_URL environment variable is required");
    }

    return SubgraphClient.createForNetwork(chainId, { subgraphUrl: url });
  }

  /**
   * Get network metadata for API response metadata
   */
  static getNetworkMetadata() {
    const networkConfig = getDefaultNetworkConfig();

    return {
      network: networkConfig.name,
      chainId: networkConfig.chainId,
      chainName: networkConfig.chainName,
      networkName: networkConfig.networkName,
      contracts: networkConfig.contracts,
    };
  }

  /**
   * Reset client instance (useful for testing)
   */
  static resetClient(): void {
    this.subgraphClient = null;
  }
}

export { ClientFactory };
