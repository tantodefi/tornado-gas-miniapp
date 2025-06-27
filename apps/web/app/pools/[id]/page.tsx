import { Metadata } from "next";
import { notFound } from "next/navigation";
import PoolDetailsPage from "@/components/features/pools/pool-details-page";

interface PoolPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PoolPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Pool ${id} - Prepaid Gas`,
    description: `View details and join gas credit pool ${id} for anonymous transactions`,
  };
}

/**
 * Individual pool details page - /pools/[id]
 * Dynamic route for pool-specific pages
 */
export default async function PoolPage({ params }: PoolPageProps) {
  const { id } = await params;

  console.log(`🔍 Pool page accessed with ID: ${id}`);

  // Simple validation - just check if ID exists
  if (!id) {
    console.log(`❌ No ID provided, redirecting to 404`);
    notFound();
  }

  console.log(`✅ Rendering pool page for ID: ${id}`);

  return <PoolDetailsPage poolId={id} />;
}

// Force dynamic rendering
export const dynamic = "force-dynamic";
