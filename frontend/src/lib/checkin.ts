import { calcDistance } from "./geo";

export const CHECKIN_RADIUS = 200; // チェックイン可能距離（メートル）

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
  timestamp: number; // Unix timestamp
  lat: number;
  lng: number;
};

/**
 * チェックイン可能か判定
 */
export function canCheckIn(
  user: UserLocation,
  brewery: Brewery
): boolean {
  if (!user) return false;

  const distance = getDistanceToBrewery(user, brewery);
  if (distance === null) return false;

  return canCheckInByDistance(distance);
}


/**
 * 距離（m）からチェックイン可能か判定
 */
export function canCheckInByDistance(distance: number): boolean {
  return distance <= CHECKIN_RADIUS;
}


/**
 * ブルワリーまでの距離を取得
 */
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

/**
 * 距離を人間が読みやすい形式に変換
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

/**
 * チェックイン履歴をlocalStorageに保存
 */
export function saveCheckIn(record: CheckInRecord): void {
  const key = "beer-ohenro-checkins";
  const existing = localStorage.getItem(key);
  const records: CheckInRecord[] = existing ? JSON.parse(existing) : [];
  
  // 同じブルワリーの既存チェックインを削除
  const filtered = records.filter(r => r.breweryId !== record.breweryId);
  
  // 新しいチェックインを追加
  filtered.push(record);
  
  localStorage.setItem(key, JSON.stringify(filtered));
}

/**
 * チェックイン履歴を取得
 */
export function getCheckIns(): CheckInRecord[] {
  const key = "beer-ohenro-checkins";
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

/**
 * チェックイン済みか（キャッシュ用Set版）
 */
export function isCheckedInBySet(
  breweryId: string,
  checkedInIds: Set<string>
): boolean {
  return checkedInIds.has(breweryId);
}


/**
 * 特定のブルワリーにチェックイン済みか確認
 */
export function isCheckedIn(breweryId: string): boolean {
  const records = getCheckIns();
  return records.some(r => r.breweryId === breweryId);
}