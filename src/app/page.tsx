import { Metadata } from "next";

import { SearchAccounts } from "@/components/search-accounts";

export const metadata: Metadata = {
  title: "Marginfi Search - Accounts",
  description: "Search for marginfi accounts",
};

export default function AccountsSearchPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-16">
      <h1 className="text-4xl">Search marginfi accounts</h1>
      <SearchAccounts />
    </div>
  );
}
