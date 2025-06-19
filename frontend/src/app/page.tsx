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
          .map((b: any) => ({
            name: b.brand || b.name,  // brand または name を優先して表示
            latitude: parseFloat(b.lat || b.latitude),
            longitude: parseFloat(b.lng || b.longitude),
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
}