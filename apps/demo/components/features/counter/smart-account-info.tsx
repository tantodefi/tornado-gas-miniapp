"use client";

import { Button } from "@workspace/ui/components/button";
import { Copy } from "lucide-react";
import { useSmartAccount } from "@/context/SmartAccountContext";
import { formatAddress } from "@/lib/utils";

export function SmartAccountInfo() {
  const { smartAccountClient } = useSmartAccount();

  if (!smartAccountClient || !smartAccountClient.account) {
    return null;
  }

  const copyAddress = async () => {
    if (smartAccountClient?.account?.address) {
      await navigator.clipboard.writeText(smartAccountClient.account.address);
    }
  };

  return (
    <div className="space-y-2 p-3 bg-muted rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Smart Account:</span>
        <p className="text-xs font-mono text-muted-foreground">
          {formatAddress(smartAccountClient.account.address)}
        </p>
        <Button size="sm" variant="ghost" onClick={copyAddress}>
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
