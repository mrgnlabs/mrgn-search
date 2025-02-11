import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { getConfig, MarginfiClient } from "@mrgnlabs/marginfi-client-v2";
import { Connection } from "@solana/web3.js";
import { Wallet, loadBankMetadatas } from "@mrgnlabs/mrgn-common";

import { Account } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("wallet");
    let wallet: PublicKey = PublicKey.default;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 },
      );
    }

    try {
      wallet = new PublicKey(walletAddress);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 },
      );
    }

    const bankMetadatas = await loadBankMetadatas();

    const connection = new Connection(process.env.RPC_URL!);
    const client = await MarginfiClient.fetch(
      getConfig(),
      {} as Wallet,
      connection,
    );

    const marginfiAccounts =
      await client.getMarginfiAccountsForAuthority(wallet);

    const data: Account[] = marginfiAccounts
      .map((account) => {
        const maintenanceComponentsWithBiasAndWeighted =
          account.computeHealthComponents(1);

        const healthFactor =
          maintenanceComponentsWithBiasAndWeighted.assets.isZero()
            ? 1
            : maintenanceComponentsWithBiasAndWeighted.assets
                .minus(maintenanceComponentsWithBiasAndWeighted.liabilities)
                .dividedBy(maintenanceComponentsWithBiasAndWeighted.assets)
                .toNumber();

        const balances = account.balances
          .map((balance) => {
            const bank = client.getBankByPk(balance.bankPk);
            const bankMetadata = bankMetadatas[balance.bankPk.toBase58()];

            if (!bank) {
              return undefined;
            }

            const amounts = balance.computeQuantity(bank);
            const amountsUsd = balance.computeUsdValue(
              bank,
              client.oraclePrices.get(balance.bankPk.toBase58())!,
            );

            return {
              assets: amounts.assets.toNumber(),
              liabilities: amounts.liabilities.toNumber(),
              assetsUsd: amountsUsd.assets.toNumber(),
              liabilitiesUsd: amountsUsd.liabilities.toNumber(),
              bankMetadata: bankMetadata,
            };
          })
          .filter((balance) => balance !== undefined);

        if (!balances.length) {
          return undefined;
        }

        const totalAssetsUsd = balances
          .reduce(
            (acc, balance) => acc.plus(balance.assetsUsd),
            new BigNumber(0),
          )
          .toNumber();

        const totalLiabilitiesUsd = balances
          .reduce(
            (acc, balance) => acc.plus(balance.liabilitiesUsd),
            new BigNumber(0),
          )
          .toNumber();

        const portfolioBalanceUsd = totalAssetsUsd - totalLiabilitiesUsd;

        return {
          address: account.address.toBase58(),
          healthFactor,
          totalAssetsUsd,
          totalLiabilitiesUsd,
          portfolioBalanceUsd,
          balances,
        };
      })
      .filter((account) => account !== undefined);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
