import { Metadata } from "next";
import CardIssuanceFlow from "@/components/card-issuance-flow";

export const metadata: Metadata = {
  title: "Issue Gas Card - Prepaid Gas",
  description:
    "Issue a new prepaid gas card for anonymous blockchain transactions",
};

/**
 * Card issuance page - /cards/issue
 * Pure Server Component - no event handlers needed
 */
export default function CardIssuePage() {
  return <CardIssuanceFlow />;
}
