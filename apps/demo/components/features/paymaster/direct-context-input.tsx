// file: prepaid-gas-website/apps/demo/components/features/paymaster/direct-context-input.tsx
"use client";

import { useState, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
  Ticket,
  ArrowRight,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Identity } from "@semaphore-protocol/core";
import { PaymasterDataService } from "@workspace/core";
import { fromHex } from "viem";

interface DirectContextInputProps {
  onValidContext: (config: {
    paymasterAddress: string;
    poolId: string;
    identity: Identity;
    paymasterContext: string;
  }) => void;
  isLoading?: boolean;
}

export function DirectContextInput({
  onValidContext,
  isLoading,
}: DirectContextInputProps) {
  const [contextValue, setContextValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (isLoading || isProcessing) return;
      setContextValue(e.target.value);
      if (error) setError(null); // Clear error when user starts typing
    },
    [isLoading, isProcessing, error],
  );

  const handleSubmit = useCallback(async () => {
    if (isLoading || isProcessing || !contextValue.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Validate that the input looks like a hex string
      const trimmedContext = contextValue.trim();
      if (!trimmedContext.startsWith("0x")) {
        throw new Error(
          "Paymaster context must be a hex string starting with '0x'",
        );
      }

      // Use PaymasterDataService to parse the context
      const paymasterDataService = new PaymasterDataService();
      const parsedContext = paymasterDataService.parseContext(trimmedContext);

      console.log("🔍 Raw parsed context:", parsedContext);

      // Validate that we have all required fields
      if (!parsedContext.paymasterAddress) {
        throw new Error("Missing paymaster address in context");
      }

      if (parsedContext.poolId === undefined || parsedContext.poolId === null) {
        throw new Error("Missing pool ID in context");
      }

      if (!parsedContext.identityString) {
        throw new Error(
          "Missing identity in context - this context may be from an older version",
        );
      }

      // Convert bytes identity back to string
      let identityBase64: string;
      try {
        // The identityString is stored as hex bytes, we need to convert it back to string
        const identityHex = parsedContext.identityString as `0x${string}`;

        // Try direct fromHex conversion first
        try {
          identityBase64 = fromHex(identityHex, "string");
          console.log("🔍 Converted identity from hex bytes to string:", {
            hex: identityHex,
            string: identityBase64,
          });
        } catch (hexError) {
          // If that fails, the identityString might already be a string, not hex bytes
          console.log("🔍 Identity may already be a string, not hex bytes");
          if (typeof parsedContext.identityString === "string") {
            identityBase64 = parsedContext.identityString;
            console.log("🔍 Using identity string directly:", identityBase64);
          } else {
            throw hexError;
          }
        }
      } catch (conversionError) {
        console.error("Identity conversion error:", conversionError);
        throw new Error(
          `Failed to decode identity from context: ${conversionError instanceof Error ? conversionError.message : "Unknown error"}`,
        );
      }

      // Create Identity from the parsed identity string
      let identity: Identity;
      try {
        identity = Identity.import(identityBase64);
        console.log(
          "✅ Successfully imported identity, commitment:",
          identity.commitment.toString(),
        );
      } catch (identityError) {
        console.error("Identity import error:", identityError);
        throw new Error(
          "Invalid identity in paymaster context - cannot import identity",
        );
      }

      console.log("✅ Successfully parsed paymaster context:", {
        paymasterAddress: parsedContext.paymasterAddress,
        poolId: parsedContext.poolId.toString(),
        identityCommitment: identity.commitment.toString(),
      });

      // Call the callback with parsed data
      onValidContext({
        paymasterAddress: parsedContext.paymasterAddress,
        poolId: parsedContext.poolId.toString(),
        identity: identity,
        paymasterContext: trimmedContext,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid paymaster context format";
      setError(message);
      console.error("Context parsing error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [contextValue, isLoading, isProcessing, onValidContext]);

  const isValid =
    contextValue.trim().length > 0 && contextValue.trim().startsWith("0x");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
          <Ticket className="w-4 h-4" />
          Quick Setup
        </div>
        <p className="text-sm text-muted-foreground">
          Paste the paymaster context from your gas card to configure instantly
        </p>
      </div>

      {/* Context Input */}
      <div className="space-y-2">
        <Label htmlFor="context-input" className="flex items-center gap-2">
          <Ticket className="h-4 w-4" />
          Paymaster Context
        </Label>
        <Textarea
          id="context-input"
          placeholder="Paste your encoded paymaster context here (starts with 0x...)&#10;&#10;Example:&#10;0x1234567890abcdef..."
          value={contextValue}
          onChange={handleContextChange}
          disabled={isLoading || isProcessing}
          rows={4}
          className="font-mono text-sm resize-none max-h-32 overflow-y-auto break-all"
          style={{
            wordBreak: "break-all",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap",
          }}
        />
        <p className="text-xs text-muted-foreground">
          This is the encoded context you copied from the web app after joining
          a pool
        </p>
      </div>

      {/* Validation Status */}
      {contextValue.trim() && (
        <Alert
          className={
            isValid
              ? "border-green-200 bg-green-50 dark:bg-green-900/20"
              : "border-red-200 bg-red-50 dark:bg-red-900/20"
          }
        >
          {isValid ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-400">
                Valid paymaster context format detected
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-400">
                Must be a hex string starting with '0x'
              </AlertDescription>
            </>
          )}
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading || isProcessing || !isValid}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Parsing Context...
          </>
        ) : (
          <>
            Configure Paymaster
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
