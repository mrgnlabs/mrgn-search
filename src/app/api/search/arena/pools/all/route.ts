import { NextResponse } from "next/server";
import { ArenaPool } from "@/lib/types";

export async function GET() {
  try {
    if (!process.env.MARGINFI_API_URL || !process.env.MARGINFI_API_KEY) {
      console.error("Missing required environment variables");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 },
      );
    }

    const arenaPoolsRes = await fetch(
      process.env.MARGINFI_API_URL + "/arena/pools",
      {
        headers: {
          "x-api-key": process.env.MARGINFI_API_KEY,
        },
      },
    );

    if (!arenaPoolsRes.ok) {
      console.error("Failed to fetch arena pools:", arenaPoolsRes.statusText);
      return NextResponse.json({ banks: [] }, { status: 200 });
    }

    const arenaPoolsData = (await arenaPoolsRes.json()) as {
      data: ArenaPool[];
    };

    const arenaPools = arenaPoolsData.data?.filter((pool) => pool.group) ?? [];
    const banks = arenaPools.filter((pool) => pool.base_bank.mint.address);

    return NextResponse.json({ banks }, { status: 200 });
  } catch (error) {
    console.error("Error fetching arena pools:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
