//file:prepaid-gas-website/apps/web/lib/services/client-factory.ts
import { SubgraphClient } from "@workspace/data";

/**
 * Singleton factory for creating and managing SubgraphClient instances
 */
class ClientFactory {
  private static subgraphClient: SubgraphClient | null = null;

  static getSubgraphClient(): SubgraphClient {
    if (!this.subgraphClient) {
      const subgraphUrl = process.env.SUBGRAPH_URL;

      if (!subgraphUrl) {
        throw new Error("SUBGRAPH_URL environment variable is required");
      }

      // ✨ NEW: Use factory method with Base Sepolia preset (chainId: 84532)
      this.subgraphClient = SubgraphClient.createForNetwork(84532, {
        subgraphUrl, // Override with env variable
      });
    }

    return this.subgraphClient;
  }

  static resetClient(): void {
    this.subgraphClient = null;
  }
}

export { ClientFactory };
