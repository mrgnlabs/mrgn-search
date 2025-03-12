import { BankMetadata } from "@mrgnlabs/mrgn-common";

export type Balance = {
  assets: number;
  liabilities: number;
  assetsUsd: number;
  liabilitiesUsd: number;
  bankAddress: string;
  bankMetadata: BankMetadata;
};

export type Account = {
  address: string;
  healthFactor: number;
  totalAssetsUsd: number;
  totalLiabilitiesUsd: number;
  portfolioBalanceUsd: number;
  balances: Balance[];
  pool?: ArenaPool;
  totalPortfolioSizeUsd?: number;
};

export type Bank = {
  address: string;
  tokenAddress: string;
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

export type ArenaBank = {
  address: string;
  group: string;
  mint: {
    address: string;
    decimals: number;
    name: string | null;
    symbol: string | null;
    token_program: string;
  };
  details: {
    deposit_rate: number;
    borrow_rate: number;
    total_deposits: number;
    total_deposits_usd: number;
    total_borrows: number;
    total_borrows_usd: number;
  };
};

export type ArenaPool = {
  group: string;
  quote_bank: ArenaBank;
  base_bank: ArenaBank;
  lookup_tables: string[];
  featured: boolean;
  created_at: string;
  created_by: string;
};

export type ArenaPoolSearchResult = {
  banks: Bank[];
};

export type BirdeyePrice = {
  value: number;
};

export type BirdeyePriceMap = {
  [key: string]: BirdeyePrice;
};
