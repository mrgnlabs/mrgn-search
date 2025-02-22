"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

import { PublicKey } from "@solana/web3.js";
import { IconSearch } from "@tabler/icons-react";

import { Account, PointsData } from "@/lib/types";
import { searchAccounts, getPoints } from "@/lib/utils";

import { CurrentAccount } from "@/components/current-account";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Input } from "@/components/ui/input";
import { CurrentAuthority } from "./current-authority";

const Search = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [points, setPoints] = React.useState<PointsData | null>(null);
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

      const accountsData = await searchAccounts(publicKey);
      const pointsData = await getPoints(walletAddress);

      if (!accountsData || !accountsData.length) {
        setError("No accounts found");
        return;
      }

      setAccounts(accountsData);
      setCurrentAccount(accountsData[0]);
      setPoints(pointsData);

      // Only update URL if the wallet address has changed
      const url = new URL(window.location.href);
      const currentWallet = url.searchParams.get("wallet");
      if (currentWallet !== walletAddress) {
        url.searchParams.set("wallet", walletAddress);
        window.history.pushState({}, "", url.toString());
      }
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
          {currentAccount && walletAddress && (
            <CurrentAuthority
              wallet={walletAddress}
              points={points}
              accounts={accounts}
              currentAccount={currentAccount}
              handleAccountChange={handleAccountChange}
            />
          )}
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
