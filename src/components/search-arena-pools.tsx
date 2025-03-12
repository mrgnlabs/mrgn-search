"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  IconCopy,
  IconCheck,
  IconSearch,
  IconExternalLink,
} from "@tabler/icons-react";
import { PublicKey } from "@solana/web3.js";

import {
  getTokenIconUrl,
  getArenaPool,
  formatUsd,
  formatUsdShort,
  formatPercentage,
} from "@/lib/utils";
import { ArenaPool, ArenaPoolSearchResult } from "@/lib/types";

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
import { AddressActions } from "@/components/address-actions";
import { Button } from "@/components/ui/button";

type SearchArenaPoolsProps = {
  pools: ArenaPool[];
};

const SearchArenaPools = ({ pools }: SearchArenaPoolsProps) => {
  const [query, setQuery] = React.useState("");
  const [isOpenCommandDialog, setIsOpenCommandDialog] = React.useState(false);
  const [selectedPool, setSelectedPool] = React.useState<ArenaPool | null>(
    null,
  );
  const [poolDetails, setPoolDetails] =
    React.useState<ArenaPoolSearchResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [groupAddressCopied, setGroupAddressCopied] = React.useState(false);
  const searchParams = useSearchParams();
  const addressParam = searchParams.get("address");

  React.useEffect(() => {
    const getPoolDetails = async () => {
      if (!selectedPool) return;
      setIsLoading(true);
      setPoolDetails(null);
      setIsOpenCommandDialog(false);
      setQuery("");

      // Only update URL if the address has changed
      const url = new URL(window.location.href);
      const currentAddress = url.searchParams.get("address");
      if (currentAddress !== selectedPool.group) {
        url.searchParams.set("address", selectedPool.group);
        window.history.pushState({}, "", url.toString());
      }

      const pool: ArenaPoolSearchResult = await getArenaPool(
        new PublicKey(selectedPool.group),
      );
      setPoolDetails(pool);
      setIsLoading(false);
    };

    getPoolDetails();
  }, [selectedPool]);

  // Add new effect to handle initial URL parameter
  React.useEffect(() => {
    if (addressParam) {
      const pool = pools.find((p) => p.group === addressParam);
      if (pool) {
        setSelectedPool(pool);
      }
    }
  }, [addressParam, pools]);

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

  if (!pools.length) return null;

  return (
    <div className="w-full space-y-12 pb-16">
      <div className="mx-auto w-full max-w-3xl">
        <Button
          onClick={() => setIsOpenCommandDialog(true)}
          variant="outline"
          className="h-12 w-full justify-start gap-3 text-lg font-light text-muted-foreground hover:bg-accent/30"
        >
          <IconSearch size={16} />
          Search by token symbol (e.g USDC)...
        </Button>
      </div>
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
        <CommandList className="max-h-[320px]">
          {query.length > 0 && <CommandEmpty>No results found.</CommandEmpty>}
          <CommandGroup heading="Pools">
            {pools.map((pool) => (
              <CommandItem
                key={pool.group}
                onSelect={() => setSelectedPool(pool)}
                disabled={isLoading}
              >
                <div className="flex items-center gap-3 text-lg font-medium">
                  <div className="relative">
                    <Image
                      src={getTokenIconUrl(pool.base_bank.mint.address)}
                      alt={
                        pool.base_bank.mint.symbol ||
                        pool.base_bank.mint.address
                      }
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <Image
                      src={getTokenIconUrl(pool.quote_bank.mint.address)}
                      alt={
                        pool.quote_bank.mint.symbol ||
                        pool.quote_bank.mint.address
                      }
                      width={16}
                      height={16}
                      className="absolute -bottom-1 -right-1 rounded-full"
                    />
                  </div>
                  {pool.base_bank.mint.symbol} / {pool.quote_bank.mint.symbol}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      {selectedPool && (
        <div className="w-full space-y-6">
          {isLoading && (
            <Loader text="Fetching pool details..." className="py-8" />
          )}
          {!isLoading && !poolDetails && (
            <div className="flex items-center justify-center gap-4">
              <p>No pool details found.</p>
            </div>
          )}
          {poolDetails && (
            <div className="flex flex-col gap-8">
              <div className="space-y-2 text-center">
                <h1 className="text-center text-2xl font-medium">
                  {selectedPool.base_bank.mint.symbol} /{" "}
                  {selectedPool.quote_bank.mint.symbol}
                </h1>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <p>{selectedPool.group}</p>
                  <div className="flex items-center gap-2">
                    <CopyToClipboard
                      text={selectedPool.group}
                      onCopy={() => setGroupAddressCopied(true)}
                    >
                      <button className="flex items-center text-muted-foreground transition-colors hover:text-foreground">
                        {groupAddressCopied ? (
                          <IconCheck size={16} />
                        ) : (
                          <IconCopy size={16} />
                        )}
                      </button>
                    </CopyToClipboard>
                    <Link
                      href={`https://solscan.io/address/${selectedPool.group}`}
                      className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
                      target="_blank"
                    >
                      <IconExternalLink size={16} />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {poolDetails.banks.map((bank) => (
                  <div
                    className="space-y-8 rounded-lg bg-muted/50 p-4"
                    key={bank.address}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 text-2xl font-medium">
                        <Image
                          src={getTokenIconUrl(bank.tokenAddress)}
                          alt={bank.tokenSymbol}
                          width={36}
                          height={36}
                          className="rounded-full"
                        />
                        {bank.tokenSymbol}
                      </div>
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
                          {formatUsd(bank.totalAssetsUsd)}
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
                          {formatUsd(bank.totalLiabilitiesUsd)}
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>TVL</CardTitle>
                          <CardDescription className="sr-only">
                            The total value locked in the bank, calculated as
                            deposits minus borrows.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-lg">
                          {formatUsd(bank.tvl)}
                        </CardContent>
                      </Card>
                    </div>
                    <ul className="w-full list-none space-y-3 text-sm">
                      <li className="grid w-full grid-cols-2 items-center">
                        <strong className="font-medium text-muted-foreground">
                          Group Address:
                        </strong>
                        <AddressActions address={selectedPool.group} />
                      </li>
                      <li className="grid w-full grid-cols-2 items-center">
                        <strong className="font-medium text-muted-foreground">
                          Bank Address:
                        </strong>
                        <AddressActions address={bank.address} />
                      </li>
                      <li className="grid w-full grid-cols-2 items-center">
                        <strong className="font-medium text-muted-foreground">
                          Mint Address:
                        </strong>
                        <AddressActions address={bank.tokenAddress} />
                      </li>
                      {bank.config.oracleKeys.length > 0 && (
                        <li className="grid w-full grid-cols-2 items-start">
                          <strong className="font-medium text-muted-foreground">
                            Oracle Addresses
                          </strong>
                          <div className="flex flex-col items-end gap-2">
                            {bank.config.oracleKeys.map((oracleKey) => (
                              <div
                                key={oracleKey}
                                className="flex items-center gap-1"
                              >
                                <AddressActions
                                  address={oracleKey}
                                  icon={
                                    bank.config.oracleSetup ===
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
                          {formatUsdShort(bank.config.depositLimit)}{" "}
                          {bank.tokenSymbol}
                        </div>
                      </li>
                      <li className="grid w-full grid-cols-2 items-center">
                        <strong className="font-medium text-muted-foreground">
                          Borrow Limit
                        </strong>
                        <div className="text-right">
                          {formatUsdShort(bank.config.borrowLimit)}{" "}
                          {bank.tokenSymbol}
                        </div>
                      </li>
                      <li className="grid w-full grid-cols-2 items-center">
                        <strong className="font-medium text-muted-foreground">
                          Asset Weight
                        </strong>
                        <div className="text-right text-green-600">
                          {formatPercentage(bank.config.assetWeight)}
                        </div>
                      </li>
                      <li className="grid w-full grid-cols-2 items-center">
                        <strong className="font-medium text-muted-foreground">
                          Liability Weight
                        </strong>
                        <div className="text-right text-yellow-500">
                          {formatPercentage(bank.config.liabilityWeight)}
                        </div>
                      </li>
                      <li className="grid w-full grid-cols-2 items-center">
                        <strong className="font-medium text-muted-foreground">
                          Utilization
                        </strong>
                        <div className="text-right">
                          {formatPercentage(bank.config.utilization)}
                        </div>
                      </li>
                      <li className="grid w-full grid-cols-2 items-center">
                        <strong className="font-medium text-muted-foreground">
                          Oracle Max Age
                        </strong>
                        <div className="text-right">
                          {bank.config.oracleMaxAge}s
                        </div>
                      </li>
                      <li className="grid w-full grid-cols-2 items-center">
                        <strong className="font-medium text-muted-foreground">
                          Operational State
                        </strong>
                        <div className="text-right">
                          {bank.config.operationalState}
                        </div>
                      </li>
                      <li className="grid w-full grid-cols-2 items-center">
                        <strong className="font-medium text-muted-foreground">
                          Insurance IR Fee
                        </strong>
                        <div className="text-right">
                          {bank.config.fees.insuranceIrFee}
                        </div>
                      </li>
                      <li className="grid w-full grid-cols-2 items-center">
                        <strong className="font-medium text-muted-foreground">
                          Protocol Fixed Fee APR
                        </strong>
                        <div className="text-right">
                          {bank.config.fees.protocolFixedFeeApr}
                        </div>
                      </li>
                      <li className="grid w-full grid-cols-2 items-center">
                        <strong className="font-medium text-muted-foreground">
                          Protocol IR Fee
                        </strong>
                        <div className="text-right">
                          {bank.config.fees.protocolIrFee}
                        </div>
                      </li>
                      <li className="grid w-full grid-cols-2 items-center">
                        <strong className="font-medium text-muted-foreground">
                          Protocol Origination Fee
                        </strong>
                        <div className="text-right">
                          {bank.config.fees.protocolOriginationFee}
                        </div>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { SearchArenaPools };
