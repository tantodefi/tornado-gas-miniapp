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

      this.subgraphClient = new SubgraphClient({
        subgraphUrl,
        network: {
          name: "Base",
          chainId: 84532,
          chainName: "Base",
          networkName: "Sepolia",
          contracts: {
            paymaster: "0xAAdb7b165057fF59a1f2a93C83CE6a183891EAf6",
          },
        },
      });
    }

    return this.subgraphClient;
  }

  static resetClient(): void {
    this.subgraphClient = null;
  }
}

export { ClientFactory };
