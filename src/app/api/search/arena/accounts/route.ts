import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";

import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import BigNumber from "bignumber.js";
import {
  MARGINFI_IDL,
  MarginfiProgram,
  MarginfiIdlType,
  getConfig,
  MarginfiClient,
} from "@mrgnlabs/marginfi-client-v2";
import { BankMetadata } from "@mrgnlabs/mrgn-common";

import { ArenaPool, PnlDataMap } from "@/lib/types";
import { MARGINFI_PROGRAM_ID } from "@/lib/consts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("wallet");

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Wallet address is required" },
      { status: 400 },
    );
  }

  try {
    const arenaPoolsRes = await fetch(
      `${process.env.MARGINFI_API_URL}/arena/pools`,
      {
        headers: {
          "x-api-key": process.env.MARGINFI_API_KEY!,
        },
      },
    );
    const arenaPoolsData = (await arenaPoolsRes.json()) as {
      data: ArenaPool[];
    };
    const arenaPools = arenaPoolsData.data.filter((pool) => pool.group);

    const arenaPoolsMap = arenaPools.reduce(
      (acc, pool) => {
        acc[pool.group] = pool;
        return acc;
      },
      {} as Record<string, ArenaPool>,
    );

    if (!arenaPoolsRes.ok || !arenaPools) {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }

    const bankAddresses: PublicKey[] = [];
    const groupAddresses: PublicKey[] = [];

    // get all bank and group addresses
    for (const pool of Object.values(arenaPools)) {
      if (!pool.group) continue;
      bankAddresses.push(
        new PublicKey(pool.base_bank.address),
        new PublicKey(pool.quote_bank.address),
      );
      groupAddresses.push(new PublicKey(pool.group));
    }

    const bankMetadataMap: {
      [address: string]: BankMetadata;
    } = {};

    for (const pool of Object.values(arenaPools)) {
      if (
        !pool.group ||
        !pool.base_bank.mint.name ||
        !pool.base_bank.mint.symbol ||
        !pool.quote_bank.mint.name ||
        !pool.quote_bank.mint.symbol
      )
        continue;
      bankMetadataMap[pool.base_bank.address] = {
        tokenAddress: pool.base_bank.mint.address,
        tokenName: pool.base_bank.mint.name,
        tokenSymbol: pool.base_bank.mint.symbol,
      };
      bankMetadataMap[pool.quote_bank.address] = {
        tokenAddress: pool.quote_bank.mint.address,
        tokenName: pool.quote_bank.mint.name,
        tokenSymbol: pool.quote_bank.mint.symbol,
      };
    }

    const arenaPnlRes = await fetch(
      `${process.env.MARGINFI_API_URL}/arena/pnl/${walletAddress}`,
      {
        headers: {
          "x-api-key": process.env.MARGINFI_API_KEY!,
        },
      },
    );
    const arenaPnlData: PnlDataMap = (await arenaPnlRes.json()).data.pools;

    const connection = new Connection(process.env.RPC_URL!);
    const wallet = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.MARGINFI_WALLET!)),
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = new AnchorProvider(connection, wallet as any, {
      ...AnchorProvider.defaultOptions(),
      commitment:
        connection.commitment ?? AnchorProvider.defaultOptions().commitment,
    });
    const idl = {
      ...(MARGINFI_IDL as unknown as MarginfiIdlType),
      address: MARGINFI_PROGRAM_ID,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program = new Program(idl, provider) as any as MarginfiProgram;

    const data = (
      await Promise.all(
        groupAddresses.map(async (groupAddress) => {
          const pool = arenaPoolsMap[groupAddress.toBase58()];
          const baseBank = await program.account.bank.fetch(
            new PublicKey(pool.base_bank.address),
          );
          const quoteBank = await program.account.bank.fetch(
            new PublicKey(pool.quote_bank.address),
          );

          if (baseBank.config.oracleSetup.none !== undefined) {
            return undefined;
          }

          if (quoteBank.config.oracleSetup.none !== undefined) {
            return undefined;
          }

          const client = await MarginfiClient.fetch(
            {
              ...getConfig(),
              groupPk: groupAddress,
            },
            {} as Wallet,
            connection,
            {
              bankMetadataMap: {
                [pool.base_bank.address]: {
                  tokenAddress: pool.base_bank.mint.address,
                  tokenName: pool.base_bank.mint.name ?? "",
                  tokenSymbol: pool.base_bank.mint.symbol ?? "",
                },
                [pool.quote_bank.address]: {
                  tokenAddress: pool.quote_bank.mint.address,
                  tokenName: pool.quote_bank.mint.name ?? "",
                  tokenSymbol: pool.quote_bank.mint.symbol ?? "",
                },
              },
              preloadedBankAddresses: [
                new PublicKey(pool.base_bank.address),
                new PublicKey(pool.quote_bank.address),
              ],
            },
          );

          const marginfiAccounts =
            await client.getMarginfiAccountsForAuthority(walletAddress);

          const account = marginfiAccounts[0];

          if (!account) {
            return undefined;
          }

          const maintenanceComponentsWithBiasAndWeighted =
            account.computeHealthComponents(1);

          const healthFactor =
            maintenanceComponentsWithBiasAndWeighted.assets.isZero()
              ? 1
              : maintenanceComponentsWithBiasAndWeighted.assets
                  .minus(maintenanceComponentsWithBiasAndWeighted.liabilities)
                  .dividedBy(maintenanceComponentsWithBiasAndWeighted.assets)
                  .toNumber();

          const accBalances = account.balances.filter(
            (balance) => balance.active,
          );

          if (!accBalances.length) {
            return undefined;
          }

          const balances = accBalances
            .map((balance) => {
              const bank = client.getBankByPk(balance.bankPk);

              if (!bank) {
                return undefined;
              }

              const bankMetadata = bankMetadataMap[balance.bankPk.toBase58()];
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
                b.assetsUsd - a.assetsUsd ||
                b.liabilitiesUsd - a.liabilitiesUsd,
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

          const pnlData = arenaPnlData[groupAddress.toBase58()];
          const pnl = pnlData ? pnlData.total_pnl_usd : undefined;

          return {
            address: account.address.toBase58(),
            pool,
            group: groupAddress.toBase58(),
            healthFactor,
            totalAssetsUsd,
            totalLiabilitiesUsd,
            portfolioBalanceUsd,
            balances,
            pnl,
          };
        }),
      )
    ).filter((account) => account !== undefined);

    // Calculate total portfolio size in USD across all accounts
    const totalPortfolioSizeUsd = data.reduce(
      (total, account) => total + account.portfolioBalanceUsd,
      0,
    );

    return NextResponse.json({
      accounts: data,
      totalPortfolioSizeUsd,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
