import { Metadata } from "next";
import { Suspense } from "react";

import { SearchArenaPools } from "@/components/search-arena-pools";
import { Loader } from "@/components/ui/loader";
import { ArenaPool } from "@/lib/types";

export const metadata: Metadata = {
  title: "Arena Search - Banks",
  description: "Search for arena banks",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getBanks() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const arenaPoolsRes = await fetch(`${baseUrl}/api/search/arena/pools/all`, {
      next: { revalidate: 0 },
    });

    if (!arenaPoolsRes.ok) {
      console.error("Failed to fetch banks:", arenaPoolsRes.statusText);
      return [];
    }

    const arenaPoolsData = await arenaPoolsRes.json();

    if (!arenaPoolsData.banks) {
      return [];
    }

    const arenaPools: ArenaPool[] = arenaPoolsData.banks.filter(
      (pool: ArenaPool) => pool.group,
    );

    return arenaPools.filter((pool) => pool.base_bank.mint.address);
  } catch (error) {
    console.error("Error fetching banks:", error);
    return [];
  }
}

export default async function BanksSearchPage() {
  const pools = await getBanks();

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 pb-8 pt-16">
      <h1 className="text-4xl">Search for arena pools</h1>
      <Suspense fallback={<Loader text="Loading pools..." />}>
        <SearchArenaPools pools={pools} />
      </Suspense>
    </div>
  );
}
