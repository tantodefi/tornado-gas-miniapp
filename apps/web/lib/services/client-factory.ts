//file:prepaid-gas-website/apps/web/lib/services/client-factory.ts
import { SubgraphClient, SerializedPool } from "@workspace/data";
import { NETWORK_CONFIG, getDefaultNetworkConfig } from "@/constants/network";

/**
 * Singleton factory for creating and managing SubgraphClient instances
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
   * Add network information to serialized pools using default network config
   */
  static addNetworkInfoToPools(
    pools: SerializedPool[],
  ): (SerializedPool & { network: any })[] {
    const networkConfig = getDefaultNetworkConfig();

    return pools.map((pool) => ({
      ...pool,
      network: {
        name: networkConfig.name,
        chainId: networkConfig.chainId,
        chainName: networkConfig.chainName,
        networkName: networkConfig.networkName,
        contracts: networkConfig.contracts,
      },
    }));
  }

  /**
   * Add network information to a single serialized pool using default network config
   */
  static addNetworkInfoToPool(
    pool: SerializedPool,
  ): SerializedPool & { network: any } {
    const networkConfig = getDefaultNetworkConfig();

    return {
      ...pool,
      network: {
        name: networkConfig.name,
        chainId: networkConfig.chainId,
        chainName: networkConfig.chainName,
        networkName: networkConfig.networkName,
        contracts: networkConfig.contracts,
      },
    };
  }

  /**
   * Get network metadata for responses
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
