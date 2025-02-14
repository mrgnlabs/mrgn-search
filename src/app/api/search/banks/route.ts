import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import {
  AssetTag,
  getConfig,
  MarginfiClient,
  MarginRequirementType,
  PriceBias,
} from "@mrgnlabs/marginfi-client-v2";
import { Connection } from "@solana/web3.js";
import { loadBankMetadatas, Wallet } from "@mrgnlabs/mrgn-common";

import { Bank } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bankAddress = searchParams.get("address");

    const bankMetadatas = await loadBankMetadatas();

    // If no address provided, return all bank metadata
    if (!bankAddress) {
      const allBanks = Object.entries(bankMetadatas).map(
        ([address, metadata]) => ({
          address,
          tokenSymbol: metadata.tokenSymbol,
          tokenAddress: metadata.tokenAddress,
        }),
      );
      return NextResponse.json(allBanks, { status: 200 });
    }

    const bankMetadata = bankMetadatas[bankAddress];

    if (!bankMetadata) {
      return NextResponse.json(
        { error: "Bank metadata not found for the given token symbol" },
        { status: 404 },
      );
    }

    const connection = new Connection(process.env.RPC_URL!);
    const client = await MarginfiClient.fetch(
      getConfig(),
      {} as Wallet,
      connection,
    );

    const bank = client.getBankByPk(new PublicKey(bankAddress));

    if (!bank) {
      return NextResponse.json({ error: "Bank not found" }, { status: 404 });
    }

    const oraclePrice = client.oraclePrices.get(bank.address.toBase58())!;

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

    const bankData: Bank = {
      address: bank.address.toBase58(),
      tokenSymbol: bankMetadata.tokenSymbol,
      totalAssetsUsd,
      totalLiabilitiesUsd,
      tvl,
      config: {
        assetTag:
          bank.config.assetTag === AssetTag.STAKED ? "staked" : "default",
        assetWeightInit: bank.config.assetWeightInit.toNumber(),
        assetWeightMaint: bank.config.assetWeightMaint.toNumber(),
        borrowLimit: bank.config.borrowLimit.toNumber(),
        depositLimit: bank.config.depositLimit.toNumber(),
        operationalState: bank.config.operationalState,
        riskTier: bank.config.riskTier,
        oracleKey: bank.config.oracleKeys[0].toBase58(),
        oracleMaxAge: bank.config.oracleMaxAge,
        oracleSetup: bank.config.oracleSetup,
      },
    };

    return NextResponse.json(bankData, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
