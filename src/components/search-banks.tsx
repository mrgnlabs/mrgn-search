"use client";

import React from "react";
import Image from "next/image";

import { IconSearch } from "@tabler/icons-react";
import { PublicKey } from "@solana/web3.js";

import {
  getTokenIconUrl,
  getBank,
  formatUsd,
  formatUsdShort,
  formatPercentage,
} from "@/lib/utils";
import { MARGINFI_MAIN_GROUP_ID } from "@/lib/consts";
import { BankSearchResult, Bank } from "@/lib/types";

import {
  CommandDialog,
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
import { Loader } from "@/components/ui/loader";
import { IconPyth, IconSwitchboard } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { AddressActions } from "@/components/address-actions";
import { Button } from "@/components/ui/button";

type SearchBanksProps = {
  banks: BankSearchResult[];
  stakedBanks: BankSearchResult[];
};

const SearchBanks = ({ banks, stakedBanks }: SearchBanksProps) => {
  const [query, setQuery] = React.useState("");
  const [isOpenCommandDialog, setIsOpenCommandDialog] = React.useState(false);
  const [selectedBank, setSelectedBank] =
    React.useState<BankSearchResult | null>(null);
  const [bankDetails, setBankDetails] = React.useState<Bank | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const getBankDetails = async () => {
      if (!selectedBank) return;
      setIsLoading(true);
      setBankDetails(null);
      setIsOpenCommandDialog(false);
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
    <div className="w-full space-y-8 pb-16">
      <Button
        onClick={() => setIsOpenCommandDialog(true)}
        variant="outline"
        className="h-12 w-full justify-start gap-3 text-lg font-light text-muted-foreground hover:bg-accent/30"
      >
        <IconSearch size={16} />
        Search by token symbol (e.g USDC)...
      </Button>
      <CommandDialog
        open={isOpenCommandDialog}
        onOpenChange={setIsOpenCommandDialog}
      >
        <CommandInput
          placeholder="Search by token symbol (e.g USDC)..."
          className="h-12 md:text-lg"
          value={query}
          onValueChange={(value) => setQuery(value)}
          autoFocus
        />
        <CommandList>
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
          <CommandGroup heading="Native Stake Banks">
            {stakedBanks.map((bank) => (
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
      </CommandDialog>
      {selectedBank && (
        <div className="w-full space-y-6 rounded-lg bg-muted/50 p-4">
          {isLoading && (
            <Loader text="Fetching bank details..." className="py-8" />
          )}
          {!isLoading && !bankDetails && (
            <div className="flex items-center justify-center gap-4">
              <p>No bank details found.</p>
            </div>
          )}
          {bankDetails && (
            <div className="space-y-8">
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
              <ul className="w-full list-none space-y-3 text-sm">
                <li className="grid w-full grid-cols-2 items-center">
                  <strong className="font-medium text-muted-foreground">
                    Group Address:
                  </strong>
                  <AddressActions address={MARGINFI_MAIN_GROUP_ID} />
                </li>
                <li className="grid w-full grid-cols-2 items-center">
                  <strong className="font-medium text-muted-foreground">
                    Bank Address:
                  </strong>
                  <AddressActions address={selectedBank.address} />
                </li>
                <li className="grid w-full grid-cols-2 items-center">
                  <strong className="font-medium text-muted-foreground">
                    Mint Address:
                  </strong>
                  <AddressActions address={selectedBank.tokenAddress} />
                </li>
                {bankDetails.config.oracleKeys.length > 0 && (
                  <li className="grid w-full grid-cols-2 items-start">
                    <strong className="font-medium text-muted-foreground">
                      Oracle Addresses
                    </strong>
                    <div className="flex flex-col items-end gap-2">
                      {bankDetails.config.oracleKeys.map((oracleKey) => (
                        <div
                          key={oracleKey}
                          className="flex items-center gap-1"
                        >
                          <AddressActions
                            address={oracleKey}
                            icon={
                              bankDetails.config.oracleSetup ===
                              "SwitchboardPull" ? (
                                <IconSwitchboard size={16} />
                              ) : (
                                <IconPyth size={16} />
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </li>
                )}
                <li className="grid w-full grid-cols-2 items-center">
                  <strong className="font-medium text-muted-foreground">
                    Deposit Limit
                  </strong>
                  <div className="text-right">
                    {formatUsdShort(bankDetails.config.depositLimit)}{" "}
                    {selectedBank.tokenSymbol}
                  </div>
                </li>
                <li className="grid w-full grid-cols-2 items-center">
                  <strong className="font-medium text-muted-foreground">
                    Borrow Limit
                  </strong>
                  <div className="text-right">
                    {formatUsdShort(bankDetails.config.borrowLimit)}{" "}
                    {selectedBank.tokenSymbol}
                  </div>
                </li>
                <li className="grid w-full grid-cols-2 items-center">
                  <strong className="font-medium text-muted-foreground">
                    Asset Weight
                  </strong>
                  <div className="text-right text-green-600">
                    {formatPercentage(bankDetails.config.assetWeight)}
                  </div>
                </li>
                <li className="grid w-full grid-cols-2 items-center">
                  <strong className="font-medium text-muted-foreground">
                    Liability Weight
                  </strong>
                  <div className="text-right text-yellow-500">
                    {formatPercentage(bankDetails.config.liabilityWeight)}
                  </div>
                </li>
                <li className="grid w-full grid-cols-2 items-center">
                  <strong className="font-medium text-muted-foreground">
                    Utilization
                  </strong>
                  <div className="text-right">
                    {formatPercentage(bankDetails.config.utilization)}
                  </div>
                </li>
                <li className="grid w-full grid-cols-2 items-center">
                  <strong className="font-medium text-muted-foreground">
                    Oracle Max Age
                  </strong>
                  <div className="text-right">
                    {bankDetails.config.oracleMaxAge}s
                  </div>
                </li>
                <li className="grid w-full grid-cols-2 items-center">
                  <strong className="font-medium text-muted-foreground">
                    Operational State
                  </strong>
                  <div className="text-right">
                    {bankDetails.config.operationalState}
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { SearchBanks };
