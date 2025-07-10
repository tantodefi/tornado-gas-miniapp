//file:prepaid-gas-website/apps/web/app/pools/[id]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import PoolDetailsPage from "@/components/features/pool/pool-details-page";

interface PoolPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PoolPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Pool ${id} - Prepaid Gas`,
    description: `View pool details and join gas pool ${id} for anonymous transactions`,
  };
}

/**
 * Individual pool details page - /pools/[id]
 * Dynamic route for pool-specific pages
 */
export default async function PoolPage({ params }: PoolPageProps) {
  const { id } = await params;

  // Simple validation - just check if ID exists
  if (!id) {
    console.error(`❌ No ID provided, redirecting to 404`);
    notFound();
  }

  return <PoolDetailsPage poolId={id} />;
}

// Force dynamic rendering
export const dynamic = "force-dynamic";
