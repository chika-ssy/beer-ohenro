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
          onClick={() => setSelected(brewery)}
        />
      ))}

      {selected && (
        <InfoWindow
          position={{ lat: selected.latitude, lng: selected.longitude }}
          onCloseClick={() => setSelected(null)} // これがデフォルトの「✕」ボタン
        >
          {/* 背景の白さを強調し、余白を整えたコンテナ */}
          <div style={{ 
            background: 'white', 
            padding: '12px', 
            minWidth: '180px', 
            borderRadius: '8px',
            color: '#333'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '10px',
              borderBottom: '1px solid #f0f0f0',
              paddingBottom: '6px'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '15px', 
                fontWeight: '700',
                color: '#2c2c2c'
              }}>
                {selected.name.split('_')[0]}
              </h3>
              {/* デフォルトの✕ボタンが小さい場合、ここに追加の閉じるボタンを置くことも可能です */}
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              justifyContent: 'center', 
              marginTop: '12px' 
            }}>
              {selected.url && (
                <a href={selected.url} target="_blank" rel="noopener noreferrer" 
                   style={{ textDecoration: 'none', fontSize: '22px' }} title="公式サイト">
                  🌐
                </a>
              )}
              {selected.sns && (
                <a href={selected.sns} target="_blank" rel="noopener noreferrer" 
                   style={{ textDecoration: 'none', fontSize: '22px' }} title="SNS">
                  📱
                </a>
              )}
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ textDecoration: 'none', fontSize: '22px' }}
                title="経路を調べる"
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