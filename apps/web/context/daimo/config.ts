//file:prepaid-gas-website/apps/web/context/daimo/config.ts
"use client";

import { getDefaultConfig } from "@daimo/pay";
import { createConfig } from "wagmi";

export const daimoConfig = createConfig(
  getDefaultConfig({
    appName: "Daimo Pay Demo",
  }),
);
