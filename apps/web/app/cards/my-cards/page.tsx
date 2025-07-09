//file:prepaid-gas-website/apps/web/app/cards/my-cards/page.tsx
import { Metadata } from "next";
import MyCardsPage from "@/components/features/cards/my-cards-page";

export const metadata: Metadata = {
  title: "My Gas Cards - Prepaid Gas",
  description: "View and manage your purchased gas cards",
};

/**
 * My cards page - /cards/my-cards
 * Shows all purchased cards with receipt details
 * RENAMED from /cards/pending
 */
export default function MyCards() {
  return <MyCardsPage />;
}

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";