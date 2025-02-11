import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AccountsSearchPage() {
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <p>Search for marginfi accounts</p>
      <form className="flex gap-2">
        <Input placeholder="Search by wallet address..." />
        <Button>Search</Button>
      </form>
    </div>
  );
}
