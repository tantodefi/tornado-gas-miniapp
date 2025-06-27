import { useState, useEffect, useRef, useCallback } from "react";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createSmartAccountClient } from "permissionless";
import { entryPoint07Address } from "viem/account-abstraction";
import { CLIENT_CONFIG, STORAGE_KEYS } from "@/constants/config";
import { createPublicClient, http } from "viem";
import { PrepaidGasPaymaster } from "@workspace/core";
import type { PaymasterConfig } from "@/types/paymaster";
import { baseSepolia } from "viem/chains";

type BurnerSignerKey = `0x${string}`;
type SmartAccountClient = ReturnType<typeof createSmartAccountClient>;
const BURNER_SIGNER_KEY = STORAGE_KEYS.burnerSignerKey;

export function useSmartAccountCreation(
  paymasterConfig: PaymasterConfig | null,
) {
  const [smartAccountClient, setSmartAccountClient] = useState<
    SmartAccountClient | undefined
  >(undefined);
  const [signerKey, setSignerKey] = useState<BurnerSignerKey | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refs to prevent infinite re-renders and handle cleanup
  const isSignerKeyLoadedRef = useRef(false);
  const isMountedRef = useRef(true);
  const currentConfigRef = useRef<string | null>(null);

  // Set mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load burner EOA from localStorage on mount
  useEffect(() => {
    if (isSignerKeyLoadedRef.current) {
      return; // Already loaded, prevent re-execution
    }

    const loadStoredSignerKey = () => {
      try {
        let storedSignerKey = localStorage.getItem(
          BURNER_SIGNER_KEY,
        ) as BurnerSignerKey | null;

        if (!storedSignerKey) {
          const privateKey = generatePrivateKey();
          storedSignerKey = privateKey;
          localStorage.setItem(BURNER_SIGNER_KEY, privateKey);
        }

        if (isMountedRef.current) {
          setSignerKey(storedSignerKey);
        }
      } catch (err) {
        console.error("Failed to load or generate burner EOA:", err);

        if (isMountedRef.current) {
          setError(
            "Failed to securely load or generate account. Please clear site data.",
          );
        }

        // If localStorage is corrupted or inaccessible, try to generate a new one
        try {
          localStorage.removeItem(BURNER_SIGNER_KEY);
          const privateKey = generatePrivateKey();
          if (isMountedRef.current) {
            setSignerKey(privateKey);
            localStorage.setItem(BURNER_SIGNER_KEY, privateKey);
          }
        } catch (retryErr) {
          console.error("Failed to generate new key after error:", retryErr);
          if (isMountedRef.current) {
            setError(
              "Persistent error: Cannot create or access local storage for account.",
            );
          }
        }
      } finally {
        isSignerKeyLoadedRef.current = true; // Mark as loaded
      }
    };

    loadStoredSignerKey();
  }, []); // Empty dependency array means this runs only once on mount

  const createSmartAccount = useCallback(async () => {
    if (!signerKey) {
      setError("Signer Key not available to create Smart Account.");
      return;
    }
    if (!paymasterConfig) {
      setError("Paymaster configuration is required to create Smart Account.");
      return;
    }
    if (smartAccountClient) {
      return;
    }
    if (isLoading) {
      return;
    }

    // Check if component is still mounted
    if (!isMountedRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null); // Clear previous errors on new attempt

    try {
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
      });

      const newSmartAccount = await toSimpleSmartAccount({
        owner: privateKeyToAccount(signerKey) as any,
        client: publicClient as any,
        entryPoint: {
          address: entryPoint07Address,
          version: "0.7",
        },
        index: BigInt(0),
      });

      // Check if component is still mounted after async operation
      if (!isMountedRef.current) {
        return;
      }

      const prepaidGasClient = new PrepaidGasPaymaster({
        network: "base-sepolia",
        subgraphUrl: CLIENT_CONFIG.subgraph,
      });

      const newSmartAccountClient = createSmartAccountClient({
        client: publicClient as any,
        account: newSmartAccount as any,
        bundlerTransport: http(CLIENT_CONFIG.bundler),
        paymaster: {
          getPaymasterStubData: prepaidGasClient.getPaymasterStubData,
          getPaymasterData: prepaidGasClient.getPaymasterData,
        },
        paymasterContext: paymasterConfig.paymasterContext,
      });

      // Final check before setting state
      if (isMountedRef.current) {
        setSmartAccountClient(newSmartAccountClient);
        // Update current config ref to prevent recreation
        currentConfigRef.current = JSON.stringify({
          poolId: paymasterConfig.poolId,
          paymasterContext: paymasterConfig.paymasterContext,
        });
      }
    } catch (err) {
      console.error("Failed to create Smart Account:", err);
      if (isMountedRef.current) {
        setError((err as Error).message || "Failed to create Smart Account.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [signerKey, paymasterConfig, smartAccountClient, isLoading]);

  // Auto-create Smart Account when both signerKey and paymasterConfig are available
  useEffect(() => {
    // Only attempt to auto-create if signerKey has been loaded, paymasterConfig is available, and no smartAccountClient exists yet
    if (
      isSignerKeyLoadedRef.current &&
      signerKey &&
      paymasterConfig &&
      !smartAccountClient &&
      !isLoading
    ) {
      createSmartAccount();
    }
  }, [
    signerKey,
    paymasterConfig?.poolId, // Only depend on specific fields to avoid object reference issues
    paymasterConfig?.paymasterContext,
    smartAccountClient,
    isLoading,
    createSmartAccount,
  ]);

  // Clear smart account client when paymaster config changes
  useEffect(() => {
    if (!paymasterConfig) {
      // Clear everything when no config
      if (smartAccountClient) {
        setSmartAccountClient(undefined);
        setError(null);
      }
      currentConfigRef.current = null;
      return;
    }

    const newConfigKey = JSON.stringify({
      poolId: paymasterConfig.poolId,
      paymasterContext: paymasterConfig.paymasterContext,
    });

    // Only clear if the config actually changed
    if (currentConfigRef.current && currentConfigRef.current !== newConfigKey) {
      console.log("Paymaster config changed, clearing smart account client");
      setSmartAccountClient(undefined);
      setError(null);
      currentConfigRef.current = null;
    }
  }, [
    paymasterConfig?.poolId,
    paymasterConfig?.paymasterContext,
    smartAccountClient,
  ]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    smartAccountClient,
    error,
    isLoading,

    // Actions
    createSmartAccount,
    clearError,
  };
}
