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
  const [selected, setSelected] = useState<any>(null);
  
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
      // 👇 地図の何もないところをクリックしたら選択を解除（吹き出しを閉じる）
      onClick={() => setSelected(null)}
      options={{
        clickableIcons: false, // 既存の観光スポットなどのアイコンをクリック不可にする（誤操作防止）
      }}
    >
      {/* 📍 現在地の青いピンを表示 */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "white",
          }}
          title="現在地"
        />
      )}

      {/* 🍺 ブルワリーのピン */}
      {breweries.map((brewery: any) => (
        <Marker
          key={brewery.name}
          position={{ lat: brewery.latitude, lng: brewery.longitude }}
          onClick={(e) => {
            // e.stopPropagating() の代わりに、確実にこのピンだけを選択
            setSelected(brewery);
          }}
        />
      ))}

      {/* 💬 吹き出し（カスタムバツ印付き） */}
      {selected && (
        <InfoWindow
          position={{ lat: selected.latitude, lng: selected.longitude }}
          onCloseClick={() => setSelected(null)}
        >
          <div style={{ 
            background: 'white', 
            padding: '15px', 
            minWidth: '160px', 
            position: 'relative' 
          }}>
            {/* 標準のバツが出ない場合用の、自作バツボタン */}
            <button 
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-10px',
                border: 'none',
                background: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#999'
              }}
            >
              ×
            </button>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333', fontWeight: 'bold', paddingRight: '20px' }}>
              {selected.name.split('_')[0]}
            </h3>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px' }}>
              {selected.url && (
                <a href={selected.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '20px', textDecoration: 'none' }}>🌐</a>
              )}
              {selected.sns && (
                <a href={selected.sns} target="_blank" rel="noopener noreferrer" style={{ fontSize: '20px', textDecoration: 'none' }}>📱</a>
              )}
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ fontSize: '20px', textDecoration: 'none' }}
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