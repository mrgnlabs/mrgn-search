"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { IconExternalLink, IconX } from "@tabler/icons-react";
import { PublicKey } from "@solana/web3.js";

import {
  getTokenIconUrl,
  getBank,
  shortAddress,
  formatUsd,
  formatUsdShort,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MARGINFI_MAIN_GROUP_ID } from "@/lib/consts";
import { BankSearchResult, Bank } from "@/lib/types";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { IconPyth, IconSwitchboard } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";

type SearchBanksProps = {
  banks: BankSearchResult[];
};

const SearchBanks = ({ banks }: SearchBanksProps) => {
  const [query, setQuery] = React.useState("");
  const [selectedBank, setSelectedBank] =
    React.useState<BankSearchResult | null>(null);
  const [bankDetails, setBankDetails] = React.useState<Bank | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const getBankDetails = async () => {
      if (!selectedBank) return;
      setIsLoading(true);
      setBankDetails(null);
      setQuery("");
      const bank = await getBank(new PublicKey(selectedBank.address));
      setBankDetails(bank);
      setIsLoading(false);
    };

    getBankDetails();
  }, [selectedBank]);

  // Add escape key handler
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (!banks.length) return null;

  return (
    <div className="w-full space-y-16 pb-16">
      <Command className="relative mx-auto w-full overflow-visible rounded-lg border shadow-md md:max-w-lg">
        <div className="relative w-full">
          <CommandInput
            placeholder="Search by token symbol (e.g USDC)..."
            className="h-12 md:text-lg"
            value={query}
            onValueChange={(value) => setQuery(value)}
            autoFocus
          />
          {query && selectedBank && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <IconX size={16} />
            </button>
          )}
        </div>
        <CommandList
          className={cn(
            "absolute -left-[1px] top-[45px] max-h-[316px] w-[calc(100%+1px)] border bg-background shadow-lg",
            !query && selectedBank && "hidden",
          )}
        >
          {query.length > 0 && <CommandEmpty>No results found.</CommandEmpty>}
          <CommandGroup heading="Banks">
            {banks.map((bank) => (
              <CommandItem
                key={bank.address}
                onSelect={() => setSelectedBank(bank)}
                disabled={isLoading}
              >
                <div className="flex items-center gap-3 text-lg font-medium">
                  <Image
                    src={getTokenIconUrl(bank.tokenAddress)}
                    alt={bank.tokenSymbol}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  {bank.tokenSymbol}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
      {selectedBank && (
        <div className="w-full space-y-6 rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-2xl font-medium">
              <Image
                src={getTokenIconUrl(selectedBank.tokenAddress)}
                alt={selectedBank.tokenSymbol}
                width={36}
                height={36}
                className="rounded-full"
              />
              {selectedBank.tokenSymbol}
            </div>
            {bankDetails && (
              <Badge variant="outline">
                {bankDetails.config.assetTag} Pool
              </Badge>
            )}
          </div>

          <ul className="w-full list-none">
            <li className="grid w-full grid-cols-2 items-center">
              <strong className="font-medium text-muted-foreground">
                Group Address:
              </strong>
              <Link
                href={`https://solscan.io/address/`}
                className="flex items-center justify-end gap-1"
              >
                <Button variant="ghost" size="sm">
                  <IconExternalLink size={12} />
                  {shortAddress(MARGINFI_MAIN_GROUP_ID)}
                </Button>
              </Link>
            </li>
            <li className="grid w-full grid-cols-2 items-center">
              <strong className="font-medium text-muted-foreground">
                Bank Address:
              </strong>
              <Link
                href={`https://solscan.io/address/${selectedBank.address}`}
                className="flex items-center justify-end gap-1"
              >
                <Button variant="ghost" size="sm">
                  <IconExternalLink size={12} />
                  {shortAddress(selectedBank.address)}
                </Button>
              </Link>
            </li>

            <li className="grid w-full grid-cols-2 items-center">
              <strong className="font-medium text-muted-foreground">
                Mint Address:
              </strong>
              <Link
                href={`https://solscan.io/address/${selectedBank.tokenAddress}`}
                className="flex items-center justify-end gap-1"
              >
                <Button variant="ghost" size="sm">
                  <IconExternalLink size={12} />
                  {shortAddress(selectedBank.tokenAddress)}
                </Button>
              </Link>
            </li>
            {bankDetails && bankDetails.config.oracleKeys.length > 0 && (
              <li className="grid w-full grid-cols-2 items-start pt-1.5">
                <strong className="font-medium text-muted-foreground">
                  Oracle Addresses
                </strong>
                <div className="flex flex-col items-end gap-1">
                  {bankDetails.config.oracleKeys.map((oracleKey) => (
                    <Button key={oracleKey} variant="ghost" size="sm">
                      {bankDetails.config.oracleSetup === "SwitchboardPull" ? (
                        <IconSwitchboard />
                      ) : (
                        <IconPyth />
                      )}
                      {shortAddress(oracleKey)}
                    </Button>
                  ))}
                </div>
              </li>
            )}
          </ul>
          {isLoading && (
            <Loader text="Fetching bank details..." className="pb-8" />
          )}
          {bankDetails && (
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Deposits</CardTitle>
                    <CardDescription className="sr-only">
                      The total amount of deposits in the bank.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-lg">
                    {formatUsd(bankDetails.totalAssetsUsd)}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Borrows</CardTitle>
                    <CardDescription className="sr-only">
                      The total amount of borrows in the bank.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-lg">
                    {formatUsd(bankDetails.totalLiabilitiesUsd)}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>TVL</CardTitle>
                    <CardDescription className="sr-only">
                      The total value locked in the bank, calculated as deposits
                      minus borrows.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-lg">
                    {formatUsd(bankDetails.tvl)}
                  </CardContent>
                </Card>
              </div>
              <dl className="grid w-full grid-cols-2 gap-2 text-sm">
                <dt>Deposit Limit</dt>
                <dd className="text-right">
                  {formatUsdShort(bankDetails.config.depositLimit)}{" "}
                  {selectedBank.tokenSymbol}
                </dd>
                <dt>Borrow Limit</dt>
                <dd className="text-right">
                  {formatUsdShort(bankDetails.config.borrowLimit)}{" "}
                  {selectedBank.tokenSymbol}
                </dd>
                <dt>Asset Weight Init</dt>
                <dd className="text-right">
                  {bankDetails.config.assetWeightInit}
                </dd>
                <dt>Asset Weight Maint</dt>
                <dd className="text-right">
                  {bankDetails.config.assetWeightMaint}
                </dd>
                <dt>Oracle Max Age</dt>
                <dd className="text-right">
                  {bankDetails.config.oracleMaxAge}s
                </dd>
                <dt>Operational State</dt>
                <dd className="text-right">
                  {bankDetails.config.operationalState}
                </dd>
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { SearchBanks };
