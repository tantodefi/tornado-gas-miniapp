//file: apps/web/app/pools/[paymasterAddress]/[poolId]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import PoolDetailsPage from "@/components/features/pool/pool-details-page";

interface PoolPageProps {
  params: Promise<{ paymasterAddress: string; poolId: string }>;
}

/**
 * Reuse the existing API route logic server-side
 */
async function getPoolDataSSR(paymasterAddress: string, poolId: string) {
  try {
    // Call our updated API route internally
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/prepaid-pools/${paymasterAddress}/${poolId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error(`SSR: Failed to fetch pool ${paymasterAddress}/${poolId}:`, error);
    return null;
  }
}

/**
 * Enhanced metadata using SSR data
 */
export async function generateMetadata({
  params,
}: PoolPageProps): Promise<Metadata> {
  const { paymasterAddress, poolId } = await params;

  const pool = await getPoolDataSSR(paymasterAddress, poolId);

  if (!pool) {
    return {
      title: `Pool ${poolId} - Not Found`,
      description: `Pool ${poolId} could not be found`,
    };
  }

  const joiningFeeEth = (parseInt(pool.joiningFee) / 1e18).toFixed(4);

  return {
    title: `Pool ${poolId} - ${joiningFeeEth} ETH - Prepaid Gas`,
    description: `Join gas pool ${poolId} for ${joiningFeeEth} ETH. ${pool.memberCount} members. Anonymous gas payments.`,
    openGraph: {
      title: `Gas Pool ${poolId}`,
      description: `Join for ${joiningFeeEth} ETH • ${pool.memberCount} members`,
      type: "website",
    },
  };
}

/**
 * Server component - fetch data and pass to existing component
 */
export default async function PoolPage({ params }: PoolPageProps) {
  const { paymasterAddress, poolId } = await params;

  if (!paymasterAddress || !poolId) {
    notFound();
  }

  // Fetch data server-side
  const initialPoolData = await getPoolDataSSR(paymasterAddress, poolId);

  if (!initialPoolData) {
    notFound();
  }

  // Pass to existing component with SSR data
  return <PoolDetailsPage 
    paymasterAddress={paymasterAddress}
    poolId={poolId} 
    initialData={initialPoolData} 
  />;
}

export const revalidate = 60;