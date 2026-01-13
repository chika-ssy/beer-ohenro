// src/components/BreweryMap.tsx
import { GoogleMap, Marker } from '@react-google-maps/api';
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
  userLocation: UserLocation | null;
};

const containerStyle = {
  width: '100%',
  height: '500px',
};

export default function BreweryMap({ breweries, userLocation }: Props) {
  const center = useMemo(() => {
    return userLocation || { lat: 34.3428, lng: 134.0466 };
  }, [userLocation]);

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
      {userLocation && (
        <Marker
          position={userLocation}
          title="現在地"
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          }}
        />
      )}

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