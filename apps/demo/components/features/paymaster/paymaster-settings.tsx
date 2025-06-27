"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Settings, CreditCard, AlertTriangle } from "lucide-react";
import { Identity } from "@semaphore-protocol/core";
import { usePaymaster } from "@/context/PaymasterContext";
import { validatePaymasterConfig } from "@/lib/validation";
import type { PaymasterConfig } from "@/types/paymaster";
import { PaymasterStatus } from "./paymaster-status";
import { IdentityInput } from "./identity-input";
import { GroupSelector } from "./group-selector";

interface PaymasterSettingsProps {
  children?: React.ReactNode;
}

type DialogStep = "identity" | "group-selection";

export function PaymasterSettings({ children }: PaymasterSettingsProps) {
  const { isConfigured, error, setPaymasterConfig, clearPaymasterConfig } =
    usePaymaster();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<DialogStep>("identity");
  const [isLoading, setIsLoading] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // Step state
  const [semaphoreIdentity, setSemaphoreIdentity] = useState<Identity>();

  const handleValidIdentity = (identity: Identity) => {
    setSemaphoreIdentity(identity);
    setCurrentStep("group-selection");
  };

  const handleSelectGroup = async (poolId: string) => {
    if (!semaphoreIdentity) {
      setStepError("No identity available");
      return;
    }

    try {
      setIsLoading(true);
      setStepError(null);

      // TODO: Generate actual paymasterContext based on poolId and identity
      // For now, using a placeholder - user said they'll specify what this should be
      const paymasterContext = poolId; // Placeholder - needs actual implementation

      const newPaymasterConfig: PaymasterConfig = {
        poolId: poolId,
        identity: semaphoreIdentity.export(),
        paymasterContext: paymasterContext,
      };

      // Validate the configuration
      const validation = validatePaymasterConfig(newPaymasterConfig);
      if (!validation.isValid) {
        setStepError(validation.errors.join(", "));
        return;
      }

      // Save configuration
      setPaymasterConfig(newPaymasterConfig);

      // Close dialog on success
      setIsOpen(false);
      resetDialog();
    } catch (error) {
      console.error("Save paymaster config error:", error);
      setStepError(
        error instanceof Error ? error.message : "Failed to save configuration",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setCurrentStep("identity");
    setSemaphoreIdentity(undefined);
    setStepError(null);
    setIsLoading(false);
  };

  const handleClear = () => {
    clearPaymasterConfig();
    setIsOpen(false);
    resetDialog();
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetDialog();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon" className="relative">
            <Settings className="h-4 w-4" />
            {!isConfigured && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {currentStep === "identity"
              ? "Configure Identity"
              : "Select Paymaster Group"}
          </DialogTitle>
          <DialogDescription>
            {currentStep === "identity"
              ? "Enter your Semaphore identity to find available paymaster groups."
              : "Choose from your available paymaster groups found on-chain."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Configuration Status */}
          {isConfigured && currentStep === "identity" && (
            <PaymasterStatus onClear={handleClear} />
          )}

          {/* Step Content */}
          {currentStep === "identity" ? (
            <IdentityInput
              onValidIdentity={handleValidIdentity}
              isLoading={isLoading}
            />
          ) : (
            semaphoreIdentity && (
              <GroupSelector
                identity={semaphoreIdentity}
                onBack={() => setCurrentStep("identity")}
                onSelectGroup={handleSelectGroup}
                isLoading={isLoading}
              />
            )
          )}

          {/* Error Display */}
          {(stepError || error) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{stepError || error}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
