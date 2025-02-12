import { Metadata } from "next";

import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Marginfi Search - Banks",
  description: "Search for marginfi banks",
};

export default function BanksSearchPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 pb-8 pt-16">
      <h1 className="text-3xl">Search for marginfi banks</h1>
      <form className="flex w-full gap-2">
        <SearchInput placeholder="Search by bank address or symbol (e.g USDC)..." />
        <Button size="lg">Search</Button>
      </form>
    </div>
  );
}
