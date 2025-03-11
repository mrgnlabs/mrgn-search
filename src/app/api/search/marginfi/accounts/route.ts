import { NextResponse } from "next/server";

import { getConfig, MarginfiClient } from "@mrgnlabs/marginfi-client-v2";
import { Wallet, loadBankMetadatas } from "@mrgnlabs/mrgn-common";

import BigNumber from "bignumber.js";
import { PublicKey, Connection } from "@solana/web3.js";

import { Account } from "@/lib/types";
import { STAKED_BANK_METADATA_URL } from "@/lib/consts";

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
    const stakedBankMetadatas = await loadBankMetadatas(
      STAKED_BANK_METADATA_URL,
    );

    const combinedBankMetadatas = {
      ...bankMetadatas,
      ...stakedBankMetadatas,
    };

    const preloadedBankAddresses = Object.keys(combinedBankMetadatas);

    const connection = new Connection(process.env.RPC_URL!);
    const client = await MarginfiClient.fetch(
      getConfig(),
      {} as Wallet,
      connection,
      {
        bankMetadataMap: combinedBankMetadatas,
        preloadedBankAddresses: preloadedBankAddresses.map(
          (address) => new PublicKey(address),
        ),
      },
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

            if (!bank) {
              return undefined;
            }

            const bankMetadata =
              combinedBankMetadatas[balance.bankPk.toBase58()];
            const amounts = balance.computeQuantityUi(bank);
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
              bankAddress: balance.bankPk.toBase58(),
            };
          })
          .filter((balance) => balance !== undefined)
          .sort(
            (a, b) =>
              b.assetsUsd - a.assetsUsd || b.liabilitiesUsd - a.liabilitiesUsd,
          );

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
      .filter((account) => account !== undefined)
      .sort((a, b) => b.portfolioBalanceUsd - a.portfolioBalanceUsd);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
