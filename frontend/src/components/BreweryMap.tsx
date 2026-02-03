// components/BreweryMap.tsx
'use client';

import { useState } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '450px',
  borderRadius: '12px',
};

export default function BreweryMap({ breweries, userLocation }: any) {
  const [selected, setSelected] = useState<any>(null); // クリックされたピンの状態
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  if (!isLoaded) return <div>地図を読み込み中...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={userLocation || { lat: 33.8, lng: 133.5 }}
      zoom={7}
    >
      {breweries.map((brewery: any) => (
        <Marker
          key={brewery.name}
          position={{ lat: brewery.latitude, lng: brewery.longitude }}
          onClick={() => setSelected(brewery)} // クリックで選択
        />
      ))}

      {selected && (
        <InfoWindow
          position={{ lat: selected.latitude, lng: selected.longitude }}
          onCloseClick={() => setSelected(null)}
        >
          <div style={{ padding: '8px', minWidth: '150px', color: '#333' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
              {selected.name.split('_')[0]}
            </h3>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
              {selected.url && (
                <a href={selected.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontSize: '20px' }}>
                  🌐
                </a>
              )}
              {selected.sns && (
                <a href={selected.sns} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontSize: '20px' }}>
                  📱
                </a>
              )}
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ textDecoration: 'none', fontSize: '20px' }}
              >
                📍
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}