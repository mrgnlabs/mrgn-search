import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PublicKey } from "@solana/web3.js";

import { Account, BankSearchResult, PointsData } from "@/lib/types";
import { Bank } from "@mrgnlabs/marginfi-client-v2";

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
      `/api/search/accounts?wallet=${query.toBase58()}`,
  );
  const data = await response.json();

  return data;
};

export const searchBanks = async (): Promise<BankSearchResult[]> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + "/api/search/banks",
  );
  const data = await response.json();
  return data;
};

export const getBank = async (address: PublicKey): Promise<Bank | null> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/api/search/banks?address=${address.toBase58()}`,
  );
  const data = await response.json();
  return data;
};

export const getPoints = async (wallet: string): Promise<PointsData> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + `/api/search/points?wallet=${wallet}`,
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
