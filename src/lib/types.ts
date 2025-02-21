import { BankMetadata } from "@mrgnlabs/mrgn-common";

export type Balance = {
  assets: number;
  liabilities: number;
  assetsUsd: number;
  liabilitiesUsd: number;
  bankMetadata: BankMetadata;
};

export type Account = {
  address: string;
  healthFactor: number;
  totalAssetsUsd: number;
  totalLiabilitiesUsd: number;
  portfolioBalanceUsd: number;
  balances: Balance[];
};

export type Bank = {
  address: string;
  tokenSymbol: string;
  totalAssetsUsd: number;
  totalLiabilitiesUsd: number;
  tvl: number;
  config: {
    assetTag: "Isolated" | "Native Stake" | "Global";
    assetWeightInit: number;
    assetWeightMaint: number;
    borrowLimit: number;
    depositLimit: number;
    operationalState: string;
    riskTier: string;
    oracleKeys: string[];
    oracleMaxAge: number;
    oracleSetup: string;
  };
};

export type BankSearchResult = {
  address: string;
  tokenSymbol: string;
  tokenAddress: string;
};
