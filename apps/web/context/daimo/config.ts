"use client";

import { getDefaultConfig } from "@daimo/pay";
import { createConfig } from "wagmi";

export const daimoConfig = createConfig(
  getDefaultConfig({
    appName: "Daimo Pay Demo",
  }),
);
