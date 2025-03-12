import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const addresses = searchParams.get("addresses");

  if (!addresses) {
    return NextResponse.json(
      { error: "Addresses are required" },
      { status: 400 },
    );
  }

  const res = await fetch(
    `https://public-api.birdeye.so/defi/multi_price?list_address=${addresses}`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.BIRDEYE_API_KEY!,
        "x-chain": "solana",
      },
    },
  );
  const data = await res.json();

  if (!res.ok || !data || !data.data) {
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 },
    );
  }

  return NextResponse.json(data.data, { status: 200 });
}
