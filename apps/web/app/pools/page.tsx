import { Metadata } from "next";
import PrepaidPoolsPage from "@/components/prepaid-pools-page";

export const metadata: Metadata = {
  title: "Prepaid Gas Pools",
  description:
    "Browse anonymous gas credit pools and join to start using prepaid gas",
};

/**
 * Pools listing page - /pools
 * Pure Server Component - no event handlers needed
 */
export default function PoolsPage() {
  return (
    <>
      {/* Remove the event handler props - component will handle navigation internally */}
      <PrepaidPoolsPage />
    </>
  );
}
