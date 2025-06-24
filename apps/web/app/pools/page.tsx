import { Metadata } from "next";
import Link from "next/link";
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

      {/* Floating Action Button for Card Issuance */}
      <Link href="/cards/issue">
        <button
          className="fixed bottom-6 right-6 z-50 btn-prepaid-primary btn-lg rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
          style={{
            minHeight: "56px",
            minWidth: "56px",
            borderRadius: "50%",
            padding: "0 1.5rem",
          }}
          title="Issue New Card"
        >
          ✨ Get Card
        </button>
      </Link>
    </>
  );
}
