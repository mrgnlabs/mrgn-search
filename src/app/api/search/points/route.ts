import { NextResponse } from "next/server";

import { getWalletPoints } from "@/lib/points";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "Wallet is required" }, { status: 400 });
  }

  const points = await getWalletPoints(wallet);

  return NextResponse.json(points);
}
