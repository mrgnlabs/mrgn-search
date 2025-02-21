import React from "react";

import Link from "next/link";

import { IconExternalLink, IconTrophy } from "@tabler/icons-react";

import { Account, PointsData } from "@/lib/types";
import { formatNumber, shortAddress } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";

type CurrentAuthorityProps = {
  wallet: string;
  points: PointsData | null;
  accounts: Account[];
  currentAccount: Account;
  handleAccountChange: (account: string) => void;
};

const CurrentAuthority = ({
  wallet,
  points,
  accounts,
  currentAccount,
  handleAccountChange,
}: CurrentAuthorityProps) => {
  return (
    <div className="flex flex-col items-center justify-between gap-6 text-center">
      <div className="space-y-2">
        <ul>
          <li>
            <strong className="mr-1 font-medium">Wallet:</strong>{" "}
            {shortAddress(wallet)}
          </li>
          <li className="flex items-center gap-1">
            <strong className="font-medium">Total Points:</strong>{" "}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="h-auto px-2 py-1">
                  <IconTrophy size={16} />{" "}
                  {formatNumber(points?.totalPoints || 0)}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-1">
                    <strong className="font-medium">Rank:</strong>{" "}
                    {points?.rank || "N/A"}
                  </li>
                  <li>
                    <strong className="font-medium">Deposit Points:</strong>{" "}
                    {formatNumber(points?.depositPoints || 0)}
                  </li>
                  <li>
                    <strong className="font-medium">Borrow Points:</strong>{" "}
                    {formatNumber(points?.borrowPoints || 0)}
                  </li>
                  <li>
                    <strong className="font-medium">Referral Points:</strong>{" "}
                    {formatNumber(points?.referralPoints || 0)}
                  </li>
                  <li>
                    <strong className="font-medium">Total Points:</strong>{" "}
                    {formatNumber(points?.totalPoints || 0)}
                  </li>
                </ul>
              </PopoverContent>
            </Popover>
          </li>
        </ul>
      </div>
      <div className="flex flex-col items-center justify-center gap-1 text-sm">
        <p className="text-muted-foreground">
          Found {accounts.length} accounts
        </p>
        <Select
          value={currentAccount?.address}
          onValueChange={(value) => handleAccountChange(value)}
        >
          <SelectTrigger className="h-7 w-[180px] text-sm">
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Accounts</SelectLabel>
              {accounts.map((account) => (
                <SelectItem key={account.address} value={account.address}>
                  {shortAddress(account.address)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Link
          href={`https://solscan.io/account/${currentAccount?.address}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="flex items-center gap-1 border-b text-xs text-muted-foreground transition-colors hover:text-foreground">
            <IconExternalLink size={13} />
            View on Solscan
          </button>
        </Link>
      </div>
    </div>
  );
};

export { CurrentAuthority };
