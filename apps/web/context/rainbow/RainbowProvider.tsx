//file:prepaid-gas-website/apps/web/context/rainbow/RainbowProvider.tsx
"use client";

import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { rainbowConfig } from "./config";

const queryClient = new QueryClient();

export function RainbowProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={rainbowConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
