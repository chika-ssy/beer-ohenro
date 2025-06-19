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
    fetch('http://localhost:8000/api/breweries')
      .then((res) => res.json())
      .then((data) => {
        const validData = data.filter(
          (b: Brewery) =>
            typeof b.latitude === 'number' &&
            typeof b.longitude === 'number' &&
            !isNaN(b.latitude) &&
            !isNaN(b.longitude)
        );
        setBreweries(validData);
      })
      .catch((err) => console.error('Error fetching breweries:', err));
  }, []);

  // 現在地の取得
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
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