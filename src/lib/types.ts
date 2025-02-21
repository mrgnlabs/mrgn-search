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
    assetWeight: number;
    liabilityWeight: number;
    borrowLimit: number;
    depositLimit: number;
    operationalState: string;
    riskTier: string;
    oracleKeys: string[];
    oracleMaxAge: number;
    oracleSetup: string;
    utilization: number;
  };
};

export type BankSearchResult = {
  address: string;
  tokenSymbol: string;
  tokenAddress: string;
};

export type PointsData = {
  owner: string;
  depositPoints: number;
  borrowPoints: number;
  referralPoints: number;
  totalPoints: number;
  rank: number | null;
};
