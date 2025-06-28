//file:prepaid-gas-website/apps/web/context/rainbow/config.ts
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";
import type { Config } from "wagmi";

export const rainbowConfig: Config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: process.env.NEXT_PUBLIC_RAINBOW_PROJECT_ID || "",
  chains: [baseSepolia],
  ssr: true,
});
