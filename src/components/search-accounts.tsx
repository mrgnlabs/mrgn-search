"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PublicKey } from "@solana/web3.js";
import { IconExternalLink, IconSearch } from "@tabler/icons-react";

import { Account } from "@/lib/types";
import { searchAccounts, shortAddress } from "@/lib/utils";

import { CurrentAccount } from "@/components/current-account";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";

const Search = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = React.useState<Account | null>(
    null,
  );

  const searchParams = useSearchParams();
  const walletAddress = searchParams.get("wallet");

  const handleSubmit = React.useCallback(async () => {
    const walletAddress = inputRef.current?.value;

    if (!walletAddress) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setAccounts([]);
      setCurrentAccount(null);

      const publicKey = new PublicKey(walletAddress);

      const accounts = await searchAccounts(publicKey);

      if (!accounts || !accounts.length) {
        setError("No accounts found");
        return;
      }

      setAccounts(accounts);
      setCurrentAccount(accounts[0]);

      // Update the URL search parameter without triggering a navigation
      const url = new URL(window.location.href);
      url.searchParams.set("wallet", walletAddress);
      window.history.pushState({}, "", url.toString());
    } catch (error) {
      console.error(error);
      setError("Invalid wallet address");
    } finally {
      setIsLoading(false);
    }
  }, [inputRef]);

  const handleAccountChange = (value: string) => {
    const selectedAccount = accounts.find(
      (account) => account.address === value,
    );
    setCurrentAccount(selectedAccount || null);
  };

  React.useEffect(() => {
    if (walletAddress) {
      handleSubmit();
    }
  }, [walletAddress, handleSubmit]);

  return (
    <div className="w-full space-y-12">
      <form
        className="mx-auto w-full max-w-2xl space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="flex gap-2">
          <div className="relative w-full">
            <Input
              placeholder="Search by wallet address..."
              ref={inputRef}
              required
              disabled={isLoading}
              defaultValue={walletAddress || ""}
              className="h-12 w-full pl-11 pr-4 md:text-lg"
            />
            <IconSearch
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          <Button type="submit" size="lg" disabled={isLoading}>
            Search
          </Button>
        </div>
        {error && <p className="text-center text-destructive">{error}</p>}
      </form>
      {isLoading && <Loader text="Searching accounts..." />}
      {accounts.length > 0 && (
        <div className="w-full space-y-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-muted-foreground">
              Found {accounts.length} accounts
            </p>
            <Select
              value={currentAccount?.address}
              onValueChange={(value) => handleAccountChange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Accounts</SelectLabel>
                  {accounts.map((account) => (
                    <SelectItem key={account.address} value={account.address}>
                      {shortAddress(account.address)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Link
              href={`https://solscan.io/account/${currentAccount?.address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="flex items-center gap-1 border-b text-xs text-muted-foreground transition-colors hover:text-foreground">
                <IconExternalLink size={13} />
                View on Solscan
              </button>
            </Link>
          </div>
          {currentAccount && <CurrentAccount currentAccount={currentAccount} />}
        </div>
      )}
    </div>
  );
};

const SearchAccounts = () => {
  return (
    <React.Suspense>
      <Search />
    </React.Suspense>
  );
};

export { SearchAccounts };
