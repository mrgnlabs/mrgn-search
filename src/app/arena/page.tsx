import { Metadata } from "next";

import { SearchAreanaAccounts } from "@/components/search-arena-accounts";

export const metadata: Metadata = {
  title: "Arena Search - Accounts",
  description: "Search for arena accounts",
};

export default function AccountsSearchPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-16">
      <h1 className="text-4xl">Search arena accounts</h1>
      <SearchAreanaAccounts />
    </div>
  );
}
