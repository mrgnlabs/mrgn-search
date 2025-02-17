import {
  formatPercentage,
  formatUsd,
  healthFactorColor,
  cn,
} from "@/lib/utils";
import { AssetCard } from "@/components/asset-card";

import { Account } from "@/lib/types";

type CurrentAccountProps = {
  currentAccount: Account;
};

const CurrentAccount = ({ currentAccount }: CurrentAccountProps) => {
  return (
    <div className="w-full space-y-16">
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
              <h3>Portfolio Balance: </h3>
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
                  <AssetCard type="asset" balance={balance} key={index} />
                ))}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Liabilities</h3>
            <div className="space-y-4">
              {currentAccount.balances
                .filter((balance) => balance.liabilitiesUsd > 0)
                .map((balance, index) => (
                  <AssetCard type="liability" balance={balance} key={index} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CurrentAccount };
