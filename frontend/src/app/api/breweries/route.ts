
import { NextResponse } from "next/server";
import { getValidBreweries } from "@/lib/breweries";

export async function GET() {
  try {
    const breweries = getValidBreweries();
    return NextResponse.json(breweries);
  } catch (error) {
    console.error("ブルワリー取得エラー:", error);

    return NextResponse.json(
      { error: "ブルワリー一覧を取得できませんでした" },
      { status: 500 }
    );
  }
}
