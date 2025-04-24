import { NextResponse } from "next/server";
import { ArenaPool } from "@/lib/types";

export async function GET() {
  try {
    const arenaPoolsRes = await fetch(
      process.env.MARGINFI_API_URL! + "/arena/pools",
      {
        headers: {
          "x-api-key": process.env.MARGINFI_API_KEY!,
        },
      },
    );
    const arenaPoolsData = (await arenaPoolsRes.json()) as {
      data: ArenaPool[];
    };
    console.log(arenaPoolsData);
    const arenaPools = arenaPoolsData.data.filter((pool) => pool.group);

    if (!arenaPoolsRes.ok || !arenaPools) {
      return [];
    }

    const banks = arenaPools.filter((pool) => pool.base_bank.mint.address);

    return NextResponse.json({ banks }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
