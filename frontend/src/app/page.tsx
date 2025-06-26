import Image from "next/image";
import { useEffect, useState } from 'react';
import BreweryMap from '@/components/BreweryMap';

type Brewery = {
  name: string;
  latitude: number;
  longitude: number;
};

type UserLocation = {
  lat: number;
  lng: number;
};

export default function Home() {
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  // ブルワリーデータの取得
  useEffect(() => {
    fetch('http://localhost:8000/api/breweries') // FastAPI から brewery 情報を取得
      .then((res) => res.json())
      .then((data) => {
        const validData = data
          // ダミーデータ（例: "ブランド名" というIDのもの）を除外
          .filter((b: any) => b.id !== 'ブランド名')
          // 必要な情報を整形・数値化（lat/lngは文字列で来ることがあるため）
          .map((b: any, index: number) => ({
            name: (b.brand || b.name || `不明${index}`) + `_${index}`, // ← 重複防止
            latitude: parseFloat(b.lat || b.latitude || 'NaN'),
            longitude: parseFloat(b.lng || b.longitude || 'NaN'),
          }))
          // 緯度経度が有効な数値であるものだけを抽出
          .filter(
            (b: Brewery) =>
              typeof b.latitude === 'number' &&
              typeof b.longitude === 'number' &&
              !isNaN(b.latitude) &&
              !isNaN(b.longitude)
          );

        // 最終的なデータを state にセット
        console.log(validData);
        setBreweries(validData);

      })
      .catch((err) => console.error('Error fetching breweries:', err));
  }, []);

  // 現在地の取得
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 緯度経度を state に保存
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('現在地を取得できませんでした:', error);
        }
      );
    } else {
      console.error('Geolocation API はこのブラウザでサポートされていません');
    }
  }, []);

  return (
    <div>
      <h1>ブルワリー一覧</h1>
      <ul>
        {breweries.map((brewery, index) => (
          <li key={`${brewery.name}-${index}`}>
            {brewery.name}（{brewery.latitude}, {brewery.longitude}）
          </li>
        ))}
      </ul>
      {/* 地図に現在地を渡す */}
      <BreweryMap breweries={breweries} userLocation={userLocation} />
    </div>
  );
}