import { Metadata } from "next";
import { Suspense } from "react";

import { SearchArenaPools } from "@/components/search-arena-pools";
import { Loader } from "@/components/ui/loader";
import { ArenaPool } from "@/lib/types";

export const metadata: Metadata = {
  title: "Arena Search - Banks",
  description: "Search for arena banks",
};

async function getBanks() {
  const arenaPoolsRes = await fetch(`http://202.8.10.73:3001/arena/pools`, {
    headers: {
      "x-api-key": process.env.MARGINFI_API_KEY!,
    },
  });
  const arenaPoolsData = (await arenaPoolsRes.json()) as {
    data: ArenaPool[];
  };
  const arenaPools = arenaPoolsData.data.filter((pool) => pool.group);

  if (!arenaPoolsRes.ok || !arenaPools) {
    return [];
  }

  return arenaPools.filter((pool) => pool.base_bank.mint.address);
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
