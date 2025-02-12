import { Metadata } from "next";
import { IconSearch } from "@tabler/icons-react";

import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Marginfi Search - Banks",
  description: "Search for marginfi banks",
};

export default function BanksSearchPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 pb-8 pt-16">
      <h1 className="text-3xl">Search for marginfi banks</h1>
      <form className="flex w-full gap-2">
        <div className="relative w-full">
          <Input
            placeholder="Search by token symbol (e.g USDC)..."
            required
            className="h-12 w-full pl-11 pr-4 md:text-lg"
          />
          <IconSearch
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </form>
    </div>
  );
}
