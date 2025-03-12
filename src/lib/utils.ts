import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PublicKey } from "@solana/web3.js";

import {
  Account,
  BankSearchResult,
  PointsData,
  Bank,
  ArenaPoolSearchResult,
  BirdeyePriceMap,
  ArenaPool,
  Balance,
  PositionDetails,
} from "@/lib/types";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatPercentage = (value: number) =>
  `${(value * 100).toFixed(2)}%`;

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US").format(value);
};

export const formatUsd = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export const formatUsdShort = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    minimumFractionDigits: 2,
  }).format(value);
};

export const shortAddress = (address: string | PublicKey) => {
  const addressString =
    address instanceof PublicKey ? address.toBase58() : address;
  return addressString.slice(0, 4) + "..." + addressString.slice(-4);
};

export const healthFactorColor = (
  healthFactor: number,
  type: "bg" | "text" = "text",
) => {
  if (healthFactor < 0.25) {
    return type === "bg" ? "bg-red-400" : "text-red-400";
  }

  if (healthFactor < 0.5) {
    return type === "bg" ? "bg-yellow-400" : "text-yellow-400";
  }

  return type === "bg" ? "bg-green-400" : "text-green-400";
};

export const getTokenIconUrl = (address: string) => {
  return `https://storage.googleapis.com/mrgn-public/mrgn-token-icons/${address}.png`;
};

export const searchAccounts = async (query: PublicKey): Promise<Account[]> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/api/search/marginfi/accounts?wallet=${query.toBase58()}`,
  );
  const data = await response.json();

  return data;
};

export const searchBanks = async (): Promise<BankSearchResult[]> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + "/api/search/marginfi/banks",
  );
  const data = await response.json();
  return data;
};

export const getBank = async (address: PublicKey): Promise<Bank> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/api/search/marginfi/banks?address=${address.toBase58()}`,
  );
  const data = await response.json();
  return data as Bank;
};

export const getArenaPool = async (
  groupAddress: PublicKey,
): Promise<ArenaPoolSearchResult> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/api/search/arena/pools?address=${groupAddress.toBase58()}`,
  );
  const data = await response.json();
  return data as ArenaPoolSearchResult;
};

export const getPoints = async (wallet: string): Promise<PointsData> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/api/search/marginfi/points?wallet=${wallet}`,
  );
  const data = await response.json();
  return data;
};

export const searchArenaAccounts = async (
  query: PublicKey,
): Promise<{ accounts: Account[]; totalPortfolioSizeUsd: number }> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/api/search/arena/accounts?wallet=${query.toBase58()}`,
  );
  const data = await response.json();

  return data;
};

export const getBirdeyePrices = async (
  addresses: string[],
): Promise<BirdeyePriceMap> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/api/prices?addresses=${addresses.join(",")}`,
  );
  const data = await response.json();
  console.log("data", data);
  return data;
};

export function getPositionType({
  balances,
  pool,
}: {
  balances: Balance[];
  pool: ArenaPool;
}) {
  const baseBalance = balances.find(
    (balance) => balance.bankAddress === pool.base_bank.address,
  );
  const quoteBalance = balances.find(
    (balance) => balance.bankAddress === pool.quote_bank.address,
  );

  if (!baseBalance || !quoteBalance) return "none";
  if (
    (baseBalance.assets > 0 || quoteBalance.assets > 0) &&
    baseBalance.liabilities === 0 &&
    quoteBalance.liabilities === 0
  )
    return "lp";
  if (baseBalance.assets > 0) return "long";
  if (baseBalance.liabilities > 0) return "short";
  return "none";
}

export const getPositionDetails = ({
  balances,
  pool,
}: {
  balances: Balance[];
  pool: ArenaPool;
}): PositionDetails => {
  const status = getPositionType({ balances, pool });
  const baseBalance = balances.find(
    (balance) => balance.bankAddress === pool.base_bank.address,
  );
  const quoteBalance = balances.find(
    (balance) => balance.bankAddress === pool.quote_bank.address,
  );

  let depositValue = 0,
    borrowValue = 0,
    depositSize = 0;

  if (status === "short") {
    depositValue = quoteBalance?.assetsUsd || 0;
    borrowValue = baseBalance?.liabilitiesUsd || 0;
    depositSize = quoteBalance?.assets || 0;
  } else if (status === "long") {
    depositValue = baseBalance?.assetsUsd || 0;
    borrowValue = quoteBalance?.liabilitiesUsd || 0;
    depositSize = baseBalance?.assets || 0;
  }

  const leverage = Number(
    (depositValue / (depositValue - borrowValue) + Number.EPSILON).toFixed(4),
  );

  return {
    status,
    totalUsdValue: depositValue - borrowValue,
    positionSizeUsd: depositValue,
    positionSizeToken: depositSize,
    leverage,
  };
};
