// src/components/BreweryMap.tsx
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useMemo } from 'react';

type Brewery = {
  name: string;
  latitude: number;
  longitude: number;
};

type UserLocation = {
  lat: number;
  lng: number;
};

type Props = {
  breweries: Brewery[];
  userLocation: UserLocation | null;  // 現在地を取得
};

const containerStyle = {
  width: '100%',
  height: '500px',
};

export default function BreweryMap({ breweries, userLocation }: Props) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const center = useMemo(() => {
    return userLocation || { lat: 34.3428, lng: 134.0466 }; // ← 現在地があれば優先(デフォルト:高松市)
  }, [userLocation]);

  if (loadError) {
    return <p>マップの読み込みに失敗しました</p>;
  }

  if (!isLoaded) {
    return <p>Loading Map...</p>;
  }

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
      {/* 現在地マーカー */}
      {userLocation && (
        <Marker
          position={userLocation}
          title="現在地"
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          }}
        />
      )}

      {/* ブルワリーマーカー */}
      {breweries.map((brewery, index) => (
        <Marker
          key={`${brewery.name}-${index}`}
          position={{ lat: brewery.latitude, lng: brewery.longitude }}
          title={brewery.name}
        />
      ))}
    </GoogleMap>
  );
}