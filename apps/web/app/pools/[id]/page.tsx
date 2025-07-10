//file: apps/web/app/pools/[id]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import PoolDetailsPage from "@/components/features/pool/pool-details-page";

interface PoolPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Reuse the existing API route logic server-side
 */
async function getPoolDataSSR(poolId: string) {
  try {
    // Call our own API route internally
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/prepaid-pools/${poolId}`, {
      cache: "no-store", // Fresh data for SSR
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error(`SSR: Failed to fetch pool ${poolId}:`, error);
    return null;
  }
}

/**
 * Enhanced metadata using SSR data
 */
export async function generateMetadata({
  params,
}: PoolPageProps): Promise<Metadata> {
  const { id } = await params;

  const pool = await getPoolDataSSR(id);

  if (!pool) {
    return {
      title: `Pool ${id} - Not Found`,
      description: `Pool ${id} could not be found`,
    };
  }

  const joiningFeeEth = (parseInt(pool.joiningFee) / 1e18).toFixed(4);

  return {
    title: `Pool ${id} - ${joiningFeeEth} ETH - Prepaid Gas`,
    description: `Join gas pool ${id} for ${joiningFeeEth} ETH. ${pool.memberCount} members. Anonymous gas payments.`,
    openGraph: {
      title: `Gas Pool ${id}`,
      description: `Join for ${joiningFeeEth} ETH • ${pool.memberCount} members`,
      type: "website",
    },
  };
}

/**
 * Server component - fetch data and pass to existing component
 */
export default async function PoolPage({ params }: PoolPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  // Fetch data server-side
  const initialPoolData = await getPoolDataSSR(id);

  if (!initialPoolData) {
    notFound();
  }

  // Pass to existing component with SSR data
  return <PoolDetailsPage poolId={id} initialData={initialPoolData} />;
}

export const revalidate = 60;
