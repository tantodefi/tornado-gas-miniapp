//file:prepaid-gas-website/apps/web/app/cards/pending/page.tsx
import { Metadata } from "next";
import PendingCardsPage from "@/components/features/cards/pending-cards-page";

export const metadata: Metadata = {
  title: "Pending Gas Cards - Prepaid Gas",
  description: "Manage your pending gas cards and complete the top-up process",
};

/**
 * Pending cards page - /cards/pending
 * Shows cards that have been created but not yet topped up
 */
export default function PendingPage() {
  return <PendingCardsPage />;
}

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";
