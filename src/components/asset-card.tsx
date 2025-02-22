import Image from "next/image";
import Link from "next/link";

import { Balance } from "@/lib/types";
import { getTokenIconUrl, formatUsd, formatNumber } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AssetCardProps = {
  balance: Balance;
  type: "asset" | "liability";
};

const AssetCard = ({ balance, type }: AssetCardProps) => {
  if (!balance.bankMetadata) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href={`/banks?address=${balance.bankAddress}`}>
            <div className="flex items-center gap-2">
              <Image
                src={getTokenIconUrl(balance.bankMetadata.tokenAddress)}
                alt={balance.bankMetadata.tokenSymbol}
                width={32}
                height={32}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <p className="text-sm font-medium">
                  {balance.bankMetadata.tokenName}
                </p>
                <p className="text-[13px] font-light text-muted-foreground">
                  {balance.bankMetadata.tokenSymbol}
                </p>
              </div>
            </div>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-lg">
        {type === "asset" ? (
          <p className="flex items-center gap-2">
            {formatNumber(balance.assets)} {balance.bankMetadata.tokenSymbol}
            <span className="text-sm text-muted-foreground">
              ({formatUsd(balance.assetsUsd)})
            </span>
          </p>
        ) : (
          <p className="flex items-center gap-2">
            {formatNumber(balance.liabilities)}{" "}
            {balance.bankMetadata.tokenSymbol}
            <span className="text-sm text-muted-foreground">
              ({formatUsd(balance.liabilitiesUsd)})
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export { AssetCard };
