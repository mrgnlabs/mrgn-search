"use client";

import React from "react";
import Link from "next/link";

import { PublicKey } from "@solana/web3.js";
import { IconExternalLink, IconSearch } from "@tabler/icons-react";

import { Account } from "@/lib/types";
import {
  formatPercentage,
  searchAccounts,
  shortAddress,
  formatUsd,
  cn,
} from "@/lib/utils";

import { AssetCard } from "@/components/asset-card";
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

const SearchAccounts = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = React.useState<Account | null>(
    null,
  );

  const healthFactorBgColor = (healthFactor: number) => {
    if (healthFactor < 0.25) {
      return "bg-red-400";
    }

    if (healthFactor < 0.5) {
      return "bg-orange-400";
    }

    return "bg-green-400";
  };

  const healthFactorTextColor = (healthFactor: number) => {
    if (healthFactor < 0.25) {
      return "text-red-400";
    }

    if (healthFactor < 0.5) {
      return "text-orange-400";
    }

    return "text-green-400";
  };

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
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
        console.log(publicKey);

        const accounts = await searchAccounts(publicKey);

        if (!accounts || !accounts.length) {
          setError("No accounts found");
          return;
        }

        setAccounts(accounts);
        setCurrentAccount(accounts[0]);
      } catch (error) {
        console.error(error);
        setError("Invalid wallet address");
      } finally {
        setIsLoading(false);
      }
    },
    [inputRef],
  );

  const handleAccountChange = (value: string) => {
    const selectedAccount = accounts.find(
      (account) => account.address === value,
    );
    setCurrentAccount(selectedAccount || null);
  };

  return (
    <div className="w-full space-y-12">
      <form
        className="mx-auto w-full max-w-2xl space-y-2"
        onSubmit={handleSubmit}
      >
        <div className="flex gap-2">
          <div className="relative w-full">
            <Input
              placeholder="Search by wallet address..."
              ref={inputRef}
              required
              disabled={isLoading}
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
          {currentAccount && (
            <div className="w-full space-y-16">
              <div className="space-y-6">
                <div className="flex w-full flex-col gap-1">
                  <div className="flex w-full items-center justify-between gap-2">
                    <h3 className="font-medium">Health Factor</h3>
                    <p
                      className={cn(
                        healthFactorTextColor(currentAccount.healthFactor),
                        "font-medium",
                      )}
                    >
                      {formatPercentage(currentAccount.healthFactor)}
                    </p>
                  </div>
                  <div className="flex h-2 w-full items-center rounded-sm bg-muted px-0.5">
                    <div
                      className={cn(
                        "h-1 w-1/2 rounded-sm",
                        healthFactorBgColor(currentAccount.healthFactor),
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Total Assets: </h3>
                    <p>{formatUsd(currentAccount.totalAssetsUsd)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Total Liabilities: </h3>
                    <p>{formatUsd(currentAccount.totalLiabilitiesUsd)}</p>
                  </div>

                  <div className="space-y-4">
                    {currentAccount.balances
                      .filter((balance) => balance.assetsUsd > 0)
                      .map((balance, index) => (
                        <AssetCard type="asset" balance={balance} key={index} />
                      ))}
                  </div>

                  <div className="space-y-4">
                    {currentAccount.balances
                      .filter((balance) => balance.liabilitiesUsd > 0)
                      .map((balance, index) => (
                        <AssetCard
                          type="liability"
                          balance={balance}
                          key={index}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { SearchAccounts };
