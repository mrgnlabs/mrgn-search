import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import {
  AssetTag,
  getConfig,
  MarginfiClient,
  MarginRequirementType,
  PriceBias,
  RiskTier,
  findPythPushOracleAddress,
  OracleSetup,
  PYTH_PUSH_ORACLE_ID,
  PYTH_SPONSORED_SHARD_ID,
  MARGINFI_SPONSORED_SHARD_ID,
} from "@mrgnlabs/marginfi-client-v2";
import { Connection } from "@solana/web3.js";
import { loadBankMetadatas, Wallet } from "@mrgnlabs/mrgn-common";

import { Bank } from "@/lib/types";
import { STAKED_BANK_METADATA_URL } from "@/lib/consts";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bankAddress = searchParams.get("address");

    const bankMetadatas = await loadBankMetadatas();
    const stakedBankMetadatas = await loadBankMetadatas(
      STAKED_BANK_METADATA_URL,
    );

    const combinedBankMetadatas = {
      ...bankMetadatas,
      ...stakedBankMetadatas,
    };

    // If no address provided, return all bank metadata
    if (!bankAddress) {
      return NextResponse.json(
        {
          error: "No address provided",
        },
        { status: 400 },
      );
    }

    const bankMetadata = combinedBankMetadatas[bankAddress];

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

    const assetWeightInit = bank
      .getAssetWeight(MarginRequirementType.Initial, oraclePrice)
      .toNumber();
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
            : bank.config?.assetTag && bank.config.assetTag === AssetTag.STAKED
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
        fees: {
          insuranceFeeFixedApr:
            bank.config.interestRateConfig.insuranceFeeFixedApr.toNumber(),
          insuranceIrFee:
            bank.config.interestRateConfig.insuranceIrFee.toNumber(),
          protocolFixedFeeApr:
            bank.config.interestRateConfig.protocolFixedFeeApr.toNumber(),
          protocolIrFee:
            bank.config.interestRateConfig.protocolIrFee.toNumber(),
          protocolOriginationFee:
            bank.config.interestRateConfig.protocolOriginationFee.toNumber(),
        },
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
