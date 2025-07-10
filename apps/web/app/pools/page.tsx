//file:prepaid-gas-website/apps/web/app/pools/page.tsx
import { Metadata } from "next";
import PoolsPage from "@/components/features/pools/pools-page";

export const metadata: Metadata = {
  title: "Prepaid Gas Pools",
  description:
    "Browse anonymous gas credit pools and join to start using prepaid gas",
};

/**
 * Pools listing page - /pools
 */
export default PoolsPage;
