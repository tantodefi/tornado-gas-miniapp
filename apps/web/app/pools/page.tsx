// file: apps/web/app/pools/page.tsx
import { Metadata } from "next";
import PoolsPage from "@/components/features/pools/pools-page";
import type { Pool } from "@/types/pool";

export const metadata: Metadata = {
  title: "Prepaid Gas Pools",
  description:
    "Browse anonymous gas credit pools and join to start using prepaid gas",
};

// ✅ Helper for absolute URL
const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function PoolsSSRPage() {
  let initialPools: Pool[] = [];

  try {
    const baseUrl = getBaseUrl();

    const response = await fetch(
      `${baseUrl}/api/prepaid-pools?page=0&limit=100&paginated=false`,
      {
        method: "GET",
        // Add timeout to prevent hanging during build
        signal: AbortSignal.timeout(5000),
      },
    );

    const data = await response.json();

    if (data.success) {
      initialPools = data.data;
    } else {
      console.warn("⚠️ SSR failed to fetch pools:", data.error);
    }
  } catch (err) {
    console.error("❌ SSR error fetching pools:", err);
  }

  return <PoolsPage initialPools={initialPools} />;
}

export const revalidate = 60;
