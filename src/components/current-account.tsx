import React from "react";
import Link from "next/link";

import { Account, PositionDetails } from "@/lib/types";
import {
  formatPercentage,
  formatUsd,
  healthFactorColor,
  cn,
  getPositionDetails,
} from "@/lib/utils";

import { AssetCard } from "@/components/asset-card";

type CurrentAccountProps = {
  type?: "marginfi" | "arena";
  currentAccount: Account;
};

const CurrentAccount = ({
  currentAccount,
  type = "marginfi",
}: CurrentAccountProps) => {
  const poolName = `${currentAccount.pool?.base_bank.mint.symbol}/${currentAccount.pool?.quote_bank.mint.symbol}`;

  const positionDetails: PositionDetails = React.useMemo(() => {
    if (!currentAccount.pool)
      return {
        status: "none",
        totalUsdValue: 0,
        positionSizeUsd: 0,
        positionSizeToken: 0,
        leverage: 0,
      };
    return getPositionDetails({
      balances: currentAccount.balances,
      pool: currentAccount.pool,
    });
  }, [currentAccount.balances, currentAccount.pool]);

  return (
    <div className="w-full space-y-4">
      {type === "arena" && currentAccount.pool && (
        <div className="w-full space-y-2">
          <h2 className="text-center text-lg font-medium">
            <span
              className={cn(
                "uppercase",
                positionDetails.status === "long"
                  ? "text-green-500"
                  : "text-red-500",
              )}
            >
              {positionDetails.status}
            </span>{" "}
            <Link
              href={`/arena/pools?address=${currentAccount.pool?.group}`}
              className="border-b transition-colors hover:border-transparent"
            >
              {poolName}
            </Link>{" "}
            with {positionDetails.leverage}x leverage
          </h2>
        </div>
      )}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex w-full flex-col gap-1">
            <div className="flex w-full items-center justify-between gap-2">
              <h3 className="font-medium">Health Factor</h3>
              <p
                className={cn(
                  healthFactorColor(currentAccount.healthFactor, "text"),
                  "font-medium",
                )}
              >
                {formatPercentage(currentAccount.healthFactor)}
              </p>
            </div>
            <div className="flex h-2 w-full items-center rounded-sm bg-muted px-0.5">
              <div
                className={cn(
                  "h-1 w-1/2 rounded-sm transition-all",
                  healthFactorColor(currentAccount.healthFactor, "bg"),
                )}
                style={{
                  width: `${currentAccount.healthFactor * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <h3>Total Assets: </h3>
              <p className="text-foreground">
                {formatUsd(currentAccount.totalAssetsUsd)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <h3>Total Liabilities: </h3>
              <p className="text-foreground">
                {formatUsd(currentAccount.totalLiabilitiesUsd)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <h3>{type === "arena" ? "Account" : "Portfolio"} Balance: </h3>
              <p className="text-foreground">
                {formatUsd(currentAccount.portfolioBalanceUsd)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-4">
          <div className="space-y-2">
            <h3 className="font-medium">Assets</h3>
            <div className="space-y-4">
              {currentAccount.balances
                .filter((balance) => balance.assetsUsd > 0)
                .map((balance, index) => (
                  <AssetCard
                    type="asset"
                    balance={balance}
                    key={index}
                    link={
                      type === "arena"
                        ? `/arena/pools?address=${currentAccount.pool?.group}`
                        : `/banks?address=${balance.bankAddress}`
                    }
                  />
                ))}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Liabilities</h3>
            <div className="space-y-4">
              {currentAccount.balances
                .filter((balance) => balance.liabilitiesUsd > 0)
                .map((balance, index) => (
                  <AssetCard
                    type="liability"
                    balance={balance}
                    key={index}
                    link={
                      type === "arena"
                        ? `/arena/pools?address=${currentAccount.pool?.group}`
                        : `/banks?address=${balance.bankAddress}`
                    }
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CurrentAccount };
