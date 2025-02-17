import { Metadata } from "next";
import { Suspense } from "react";
import { loadBankMetadatas } from "@mrgnlabs/mrgn-common";

import { SearchBanks } from "@/components/search-banks";
import { Loader } from "@/components/ui/loader";
import { STAKED_BANK_METADATA_URL } from "@/lib/consts";

export const metadata: Metadata = {
  title: "Marginfi Search - Banks",
  description: "Search for marginfi banks",
};

async function getBanks() {
  const bankMetadatas = await loadBankMetadatas();
  const stakedBankMetadatas = await loadBankMetadatas(STAKED_BANK_METADATA_URL);

  const combinedBankMetadatas = {
    ...bankMetadatas,
    ...stakedBankMetadatas,
  };

  const allBanks = Object.entries(combinedBankMetadatas).map(
    ([address, metadata]) => ({
      address,
      tokenSymbol: metadata.tokenSymbol,
      tokenAddress: metadata.tokenAddress,
    }),
  );

  return allBanks;
}

export default async function BanksSearchPage() {
  const banks = await getBanks();

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 pb-8 pt-16">
      <h1 className="text-3xl">Search for marginfi banks</h1>
      <Suspense fallback={<Loader text="Loading banks..." />}>
        <SearchBanks banks={banks} />
      </Suspense>
    </div>
  );
}
