import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";

export default function AccountsSearchPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 pb-8 pt-16">
      <p className="text-2xl">Search for marginfi accounts</p>
      <form className="flex w-full gap-2">
        <SearchInput placeholder="Search by wallet address..." />
        <Button size="lg">Search</Button>
      </form>
    </div>
  );
}
