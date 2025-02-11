import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import {
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

    if (!bankAddress) {
      return NextResponse.json(
        { error: "Bank address is required" },
        { status: 400 },
      );
    }

    const bankMetadatas = await loadBankMetadatas();
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
