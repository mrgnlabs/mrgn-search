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

  const banks = Object.entries(bankMetadatas).map(([address, metadata]) => ({
    address,
    tokenSymbol: metadata.tokenSymbol,
    tokenAddress: metadata.tokenAddress,
  }));

  const stakedBanks = Object.entries(stakedBankMetadatas).map(
    ([address, metadata]) => ({
      address,
      tokenSymbol: metadata.tokenSymbol,
      tokenAddress: metadata.tokenAddress,
    }),
  );

  return {
    banks,
    stakedBanks,
  };
}

export default async function BanksSearchPage() {
  const { banks, stakedBanks } = await getBanks();

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pb-8 pt-16">
      <h1 className="text-4xl">Search for marginfi banks</h1>
      <Suspense fallback={<Loader text="Loading banks..." />}>
        <SearchBanks banks={banks} stakedBanks={stakedBanks} />
      </Suspense>
    </div>
  );
}
