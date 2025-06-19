// src/components/BreweryMap.tsx
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
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
  const center = useMemo(() => {
    if (userLocation) {
      return { lat: userLocation.lat, lng: userLocation.lng };
    }
    return { lat: 34.3428, lng: 134.0466 }; // デフォルト: 高松市
  }, [userLocation]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
      {/* 現在地マーカー */}
      {userLocation && (
        <Marker
          position={{ lat: userLocation.lat, lng: userLocation.lng }}
          title="あなたの現在地"
          icon={{
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          }}
        />
      )}

      {/* ブルワリーマーカー */}
      {breweries.map((brewery, i) => (
        <Marker
          key={`${brewery.name}-${i}`}
          position={{ lat: brewery.latitude, lng: brewery.longitude }}
          title={brewery.name}
        />
      ))}
    </GoogleMap>
  );
}