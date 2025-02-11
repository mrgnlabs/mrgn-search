import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BanksPage() {
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <p>Search for marginfi banks</p>
      <form className="flex gap-2">
        <Input placeholder="Search by bank address or symbol (e.g USDC)..." />
        <Button>Search</Button>
      </form>
    </div>
  );
}
