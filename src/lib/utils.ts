import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PublicKey } from "@solana/web3.js";

import { Account, Bank } from "@/lib/types";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatPercentage = (value: number) =>
  `${(value * 100).toFixed(2)}%`;

export const formatUsd = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export const shortAddress = (address: string) => {
  return address.slice(0, 4) + "..." + address.slice(-4);
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
    `/api/search/accounts?wallet=${query.toBase58()}`,
  );
  const data = await response.json();

  return data;
};

export const searchBanks = async (query: PublicKey): Promise<Bank[]> => {
  const response = await fetch(`/api/search/banks?address=${query.toBase58()}`);
  const data = await response.json();

  return data;
};
