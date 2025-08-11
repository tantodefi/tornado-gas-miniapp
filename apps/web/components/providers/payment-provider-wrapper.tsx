//file:tornado-gas-miniapp/apps/web/components/providers/payment-provider-wrapper.tsx
"use client";

import { DaimoProvider } from "../../context/daimo/DaimoProvider";
import { RainbowProvider } from "../../context/rainbow/RainbowProvider";
import { FarcasterProvider } from "../../context/farcaster/FarcasterProvider";

// Environment-based provider detection
export function getPaymentProvider(): "daimo" | "rainbow" {
  // Check environment variables
  const daimoAppId = process.env.NEXT_PUBLIC_DAIMO_APP_ID;
  const rainbowProjectId = process.env.NEXT_PUBLIC_RAINBOW_PROJECT_ID;
  const preferredProvider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER as
    | "daimo"
    | "rainbow";

  // Explicit preference
  if (preferredProvider === "daimo" && daimoAppId) return "daimo";
  if (preferredProvider === "rainbow" && rainbowProjectId) return "rainbow";

  // Fallback logic: Daimo if configured, otherwise Rainbow (default)
  if (daimoAppId) return "daimo";

  return "rainbow"; // Default fallback
}
// Provider wrapper component
export function PaymentProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const provider = getPaymentProvider();

  return (
    <FarcasterProvider>
      {provider === "daimo" ? (
        <DaimoProvider>{children}</DaimoProvider>
      ) : (
        <RainbowProvider>{children}</RainbowProvider>
      )}
    </FarcasterProvider>
  );
}
