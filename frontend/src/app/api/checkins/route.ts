
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { authOptions } from "@/lib/authOptions";
import { getValidBreweries } from "@/lib/breweries";
import { calcDistance } from "@/lib/geo";
import { CHECKIN_RADIUS } from "@/lib/checkin";

export const runtime = "nodejs";

// 自分のチェックイン履歴を取得
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "ログインが必要です" },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("checkins")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("チェックイン取得エラー:", error);
    return NextResponse.json(
      { error: "チェックイン履歴を取得できませんでした" },
      { status: 500 }
    );
  }

  return NextResponse.json({ checkins: data });
}

// チェックインを保存
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "ログインが必要です" },
      { status: 401 }
    );
  }

  let body: {
    breweryId?: unknown;
    breweryName?: unknown;
    lat?: unknown;
    lng?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が正しくありません" },
      { status: 400 }
    );
  }

  const { breweryId, breweryName, lat, lng } = body;

  // 入力値の検証
  if (
    typeof breweryId !== "string" ||
    !breweryId.trim() ||
    typeof breweryName !== "string" ||
    !breweryName.trim() ||
    typeof lat !== "number" ||
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90 ||
    typeof lng !== "number" ||
    !Number.isFinite(lng) ||
    lng < -180 ||
    lng > 180
  ) {
    return NextResponse.json(
      { error: "チェックイン情報が正しくありません" },
      { status: 400 }
    );
  }

  // サーバーが管理するブルワリー情報を取得
  const breweries = getValidBreweries();
  const brewery = breweries.find((b) => b.id === breweryId);

  if (!brewery) {
    return NextResponse.json(
      { error: "指定されたブルワリーが見つかりません" },
      { status: 404 }
    );
  }

  // ブルワリーの正式な座標との距離を計算
  const distance = calcDistance(
    lat,
    lng,
    brewery.lat,
    brewery.lng
  );

  if (!Number.isFinite(distance) || distance > CHECKIN_RADIUS) {
    return NextResponse.json(
      { error: "チェックイン可能な範囲外です" },
      { status: 403 }
    );
  }

  // チェックインを保存
  const { data, error } = await supabaseAdmin
    .from("checkins")
    .upsert(
      {
        user_id: session.user.id,
        brewery_id: breweryId,
        brewery_name: brewery.brand,
        lat,
        lng,
        created_at: new Date().toISOString(),
      },
      { onConflict: "user_id,brewery_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("チェックイン保存エラー:", error);
    return NextResponse.json(
      { error: "チェックインを保存できませんでした" },
      { status: 500 }
    );
  }

  return NextResponse.json({ checkin: data });
}
