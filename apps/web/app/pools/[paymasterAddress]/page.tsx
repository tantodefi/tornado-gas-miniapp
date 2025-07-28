//file: apps/web/app/pools/[paymasterAddress]/[poolId]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import PoolDetailsPage from "@/components/features/pool/pool-details-page";

interface PoolPageProps {
  params: Promise<{ paymasterAddress: string; }>;
}

/**
 * Reuse the existing API route logic server-side
 */
async function getPoolDataSSR(paymasterAddress: string) {
  try {
    // Call our updated API route internally
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/prepaid-pools/${paymasterAddress}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error(
      `SSR: Failed to fetch pool ${paymasterAddress}:`,
      error,
    );
    return null;
  }
}

/**
 * Enhanced metadata using SSR data
 */
export async function generateMetadata({
  params,
}: PoolPageProps): Promise<Metadata> {
  const { paymasterAddress } = await params;

  const pool = await getPoolDataSSR(paymasterAddress);

  if (!pool) {
    return {
      title: `Pool ${paymasterAddress} - Not Found`,
      description: `Pool ${paymasterAddress} could not be found`,
    };
  }

  const joiningFeeEth = (parseInt(pool.joiningFee) / 1e18).toFixed(4);

  return {
    title: `Pool ${paymasterAddress} - ${joiningFeeEth} ETH - Prepaid Gas`,
    description: `Join gas pool ${paymasterAddress} for ${joiningFeeEth} ETH. ${pool.memberCount} members. Anonymous gas payments.`,
    openGraph: {
      title: `Gas Pool ${paymasterAddress}`,
      description: `Join for ${joiningFeeEth} ETH • ${pool.memberCount} members`,
      type: "website",
    },
  };
}

/**
 * Server component - fetch data and pass to existing component
 */
export default async function PoolPage({ params }: PoolPageProps) {
  const { paymasterAddress } = await params;

  if (!paymasterAddress ) {
    notFound();
  }

  // Fetch data server-side
  const initialPoolData = await getPoolDataSSR(paymasterAddress);

  if (!initialPoolData) {
    notFound();
  }

  // Pass to existing component with SSR data
  return (
    <PoolDetailsPage
      paymasterAddress={paymasterAddress}
      initialData={initialPoolData}
    />
  );
}

export const revalidate = 60;
