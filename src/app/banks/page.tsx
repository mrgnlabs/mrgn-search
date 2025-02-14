import { Metadata } from "next";

import { SearchBanks } from "@/components/search-banks";
import { searchBanks } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Marginfi Search - Banks",
  description: "Search for marginfi banks",
};

export default async function BanksSearchPage() {
  const banks = await searchBanks();
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 pb-8 pt-16">
      <h1 className="text-3xl">Search for marginfi banks</h1>
      <SearchBanks banks={banks} />
    </div>
  );
}
