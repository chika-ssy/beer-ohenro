import { calcDistance } from "./geo";

export const CHECKIN_RADIUS = 200;

export type Brewery = {
  id: string;
  brand: string;
  pub: string;
  company: string;
  address: string;
  lat: number;
  lng: number;
  url?: string;
  SNS?: string;
  stampUrl?: string;
};

export type UserLocation = {
  lat: number;
  lng: number;
} | null;

export type CheckInRecord = {
  breweryId: string;
  breweryName: string;
  timestamp: number;
  lat: number;
  lng: number;
  createdAt?: string;
};

// チェックイン可能か判定
export function canCheckIn(
  user: UserLocation,
  brewery: Brewery
): boolean {
  if (!user) return false;

  const distance = getDistanceToBrewery(user, brewery);
  if (distance === null) return false;

  return canCheckInByDistance(distance);
}

// 距離（m）からチェックイン可能か判定
export function canCheckInByDistance(distance: number): boolean {
  return distance <= CHECKIN_RADIUS;
}

// ブルワリーまでの距離を取得
export function getDistanceToBrewery(
  user: UserLocation,
  brewery: Brewery
): number | null {
  if (!user) return null;

  return calcDistance(
    user.lat,
    user.lng,
    brewery.lat,
    brewery.lng
  );
}

// 距離を読みやすい形式に変換
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }

  return `${(meters / 1000).toFixed(1)}km`;
}

// APIのエラーを取得する共通処理
async function throwIfNotOk(response: Response): Promise<void> {
  if (response.ok) return;

  const result = await response.json().catch(() => null);

  throw new Error(
    result?.error || `通信エラーが発生しました (${response.status})`
  );
}

// チェックインを保存
export async function saveCheckIn(
  record: CheckInRecord
): Promise<void> {
  const response = await fetch("/api/checkins", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({
      breweryId: record.breweryId,
      breweryName: record.breweryName,
      lat: record.lat,
      lng: record.lng,
    }),
  });

  await throwIfNotOk(response);
}

// 自分のチェックイン履歴を取得
export async function getCheckIns(): Promise<CheckInRecord[]> {
  const response = await fetch("/api/checkins", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  if (response.status === 401) {
    return [];
  }

  await throwIfNotOk(response);

  const result = await response.json();

  return result.checkins.map(
    (item: {
      brewery_id: string;
      brewery_name: string;
      created_at: string | null;
      lat: number;
      lng: number;
    }): CheckInRecord => ({
      breweryId: item.brewery_id,
      breweryName: item.brewery_name,
      timestamp: item.created_at
        ? new Date(item.created_at).getTime()
        : 0,
      lat: item.lat,
      lng: item.lng,
      createdAt: item.created_at ?? undefined,
    })
  );
}

// 特定のブルワリーにチェックイン済みか確認
export async function isCheckedIn(
  breweryId: string
): Promise<boolean> {
  const records = await getCheckIns();

  return records.some(
    (record) => record.breweryId === breweryId
  );
}
