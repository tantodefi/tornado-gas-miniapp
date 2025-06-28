//file:prepaid-gas-website/apps/web/context/daimo/DaimoProvider.tsx
"use client";

import React from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { DaimoPayProvider } from "@daimo/pay";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { daimoConfig } from "./config";

const queryClient = new QueryClient();

export function DaimoProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={daimoConfig}>
      <QueryClientProvider client={queryClient}>
        <DaimoPayProvider>{children}</DaimoPayProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
