import { NextResponse } from "next/server";

import { Connection, PublicKey } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import {
  getConfig,
  MarginfiClient,
  MARGINFI_SPONSORED_SHARD_ID,
  PYTH_SPONSORED_SHARD_ID,
  findPythPushOracleAddress,
  OracleSetup,
  PYTH_PUSH_ORACLE_ID,
  RiskTier,
  AssetTag,
  OraclePrice,
  MarginRequirementType,
  PriceBias,
} from "@mrgnlabs/marginfi-client-v2";
import { BankMetadata } from "@mrgnlabs/mrgn-common";

import { ArenaPool, Bank } from "@/lib/types";
import { getBirdeyePrices } from "@/lib/utils";
import { BigNumber } from "bignumber.js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupAddress = searchParams.get("address");

  if (!groupAddress) {
    return NextResponse.json(
      { error: "Group address is required" },
      { status: 400 },
    );
  }

  try {
    const arenaPoolsRes = await fetch(`http://202.8.10.73:3001/arena/pools`, {
      headers: {
        "x-api-key": process.env.MARGINFI_API_KEY!,
      },
    });
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

    const pool = arenaPoolsMap[groupAddress];

    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    const connection = new Connection(process.env.RPC_URL!);

    const client = await MarginfiClient.fetch(
      {
        ...getConfig(),
        groupPk: new PublicKey(pool.group),
      },
      {} as Wallet,
      connection,
    );

    const baseBank = client.getBankByPk(new PublicKey(pool.base_bank.address));
    const quoteBank = client.getBankByPk(
      new PublicKey(pool.quote_bank.address),
    );

    if (!baseBank || !quoteBank) {
      return NextResponse.json({ error: "Bank not found" }, { status: 404 });
    }

    const banks: Bank[] = [];

    const prices = await getBirdeyePrices([
      baseBank.mint.toBase58(),
      quoteBank.mint.toBase58(),
    ]);

    for (const bank of [baseBank, quoteBank]) {
      const bankMetadata = bankMetadataMap[bank.address.toBase58()];
      const price = prices[bank.mint.toBase58()];
      const oraclePrice: OraclePrice = {
        priceRealtime: {
          highestPrice: new BigNumber(price.value),
          lowestPrice: new BigNumber(price.value),
          price: new BigNumber(price.value),
          confidence: new BigNumber(1),
        },
        priceWeighted: {
          highestPrice: new BigNumber(price.value),
          lowestPrice: new BigNumber(price.value),
          price: new BigNumber(price.value),
          confidence: new BigNumber(1),
        },
        timestamp: new BigNumber(new Date().getTime()),
      };

      let oracleKeys = bank.config.oracleKeys.filter(
        (key) => !key.equals(PublicKey.default),
      );

      if (bank.config.oracleSetup === OracleSetup.PythPushOracle) {
        const newOracleKeys: PublicKey[] = [];

        for (const key of oracleKeys) {
          const pythSponsoredOracle = findPythPushOracleAddress(
            key.toBuffer(),
            PYTH_PUSH_ORACLE_ID,
            PYTH_SPONSORED_SHARD_ID,
          );

          const marginfiSponsoredOracle = findPythPushOracleAddress(
            key.toBuffer(),
            PYTH_PUSH_ORACLE_ID,
            MARGINFI_SPONSORED_SHARD_ID,
          );

          if (pythSponsoredOracle) {
            newOracleKeys.push(pythSponsoredOracle);
          }

          if (marginfiSponsoredOracle) {
            newOracleKeys.push(marginfiSponsoredOracle);
          }
        }

        oracleKeys = newOracleKeys;
      }

      const totalAssetsUsd = bank
        .computeAssetUsdValue(
          oraclePrice,
          bank.totalAssetShares,
          MarginRequirementType.Equity,
          PriceBias.None,
        )
        .toNumber();

      const totalLiabilitiesUsd = bank
        .computeLiabilityUsdValue(
          oraclePrice,
          bank.totalLiabilityShares,
          MarginRequirementType.Equity,
          PriceBias.None,
        )
        .toNumber();

      const tvl = bank.computeTvl(oraclePrice).toNumber();

      const utilization = bank.computeUtilizationRate().toNumber();

      const assetWeightInit = bank.config.assetWeightInit.toNumber();
      const assetWeight = assetWeightInit || 0;
      const liabilityWeight = 1 / bank.config.liabilityWeightInit.toNumber();

      const bankData: Bank = {
        address: bank.address.toBase58(),
        tokenAddress: bankMetadata.tokenAddress,
        tokenSymbol: bankMetadata.tokenSymbol,
        totalAssetsUsd,
        totalLiabilitiesUsd,
        tvl,
        config: {
          assetTag:
            bank.config.riskTier === RiskTier.Isolated
              ? "Isolated"
              : bank.config?.assetTag &&
                  bank.config.assetTag === AssetTag.STAKED
                ? "Native Stake"
                : "Global",
          assetWeight,
          liabilityWeight,
          borrowLimit: bank.config.borrowLimit.toNumber(),
          depositLimit: bank.config.depositLimit.toNumber(),
          operationalState: bank.config.operationalState,
          riskTier: bank.config.riskTier,
          oracleKeys: oracleKeys.map((key) => key.toBase58()),
          oracleMaxAge: bank.config.oracleMaxAge,
          oracleSetup: bank.config.oracleSetup,
          utilization,
        },
      };

      banks.push(bankData);
    }

    return NextResponse.json({ banks }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
