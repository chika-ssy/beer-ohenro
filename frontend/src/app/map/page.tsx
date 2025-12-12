'use client';

import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

type Brewery = {
  id: string;
  brand: string;
  pub: string;
  company: string;
  address: string;
  lat: number;
  lng: number;
  url?: string;
  SNS?: string;
};

type UserLocation = {
  lat: number;
  lng: number;
} | null;

const containerStyle = {
  width: "100%",
  height: "600px",
};

const center = {
  lat: 33.5597,
  lng: 133.5311,
};

export default function MapPage() {
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation>(null);
  const [locationError, setLocationError] = useState<string>("");

  // ブルワリーデータの取得
  useEffect(() => {
    fetch("http://localhost:8000/api/breweries")
      .then((res) => res.json())
      .then((data) => setBreweries(data))
      .catch((err) => console.error("Error fetching breweries:", err));
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
          setLocationError("");
        },
        (error) => {
          console.error("位置情報の取得に失敗しました:", error);
          setLocationError("位置情報の取得に失敗しました");
        }
      );
    } else {
      setLocationError("このブラウザは位置情報に対応していません");
    }
  }, []);

  // Google Maps Directionsへのリンクを生成
  const getDirectionsUrl = (brewery: Brewery) => {
    if (!userLocation) return null;
    
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${brewery.lat},${brewery.lng}`;
    
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  };

  // ルート検索ボタンのクリックハンドラー
  const handleDirectionsClick = (brewery: Brewery) => {
    const url = getDirectionsUrl(brewery);
    if (!url) return;

    const confirmed = window.confirm(
      `Google Mapsで「${brewery.brand}」までのルートを表示します。\n\nGoogle Mapsアプリで開きますか？`
    );

    if (confirmed) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div>
      <h1 style={{ padding: '20px', textAlign: 'center' }}>麦酒遍路 - ブルワリーマップ</h1>
      
      {locationError && (
        <div style={{ 
          padding: '12px 20px', 
          backgroundColor: 'rgba(255, 235, 238, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(198, 40, 40, 0.2)',
          color: '#c62828',
          textAlign: 'center',
          margin: '0 20px 10px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          ⚠️ {locationError}
        </div>
      )}
      
      {userLocation && (
        <div style={{ 
          padding: '12px 20px', 
          backgroundColor: 'rgba(197, 223, 201, 0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(26, 122, 31, 0.2)',
          color: '#1a7a1f',
          textAlign: 'center',
          margin: '0 20px 10px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontWeight: '500'
        }}>
          📍 現在地を取得しました
        </div>
      )}

      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={8}>
          {/* ユーザーの現在地マーカー */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
              title="現在地"
            />
          )}

          {/* ブルワリーのマーカー */}
          {breweries.map((brewery) => (
            <Marker
              key={brewery.id}
              position={{ lat: brewery.lat, lng: brewery.lng }}
              onClick={() => setSelectedBrewery(brewery)}
            />
          ))}

          {selectedBrewery && (
            <InfoWindow
              position={{ lat: selectedBrewery.lat, lng: selectedBrewery.lng }}
              onCloseClick={() => setSelectedBrewery(null)}
            >
              <div style={{ padding: '10px', minWidth: '250px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#000' }}>
                  {selectedBrewery.brand}
                </h3>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#000' }}>
                  <strong>パブ:</strong> {selectedBrewery.pub}
                </p>
                <p style={{ margin: '4px 0 8px 0', fontSize: '13px', color: '#000' }}>
                  📍 {selectedBrewery.address}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {/* ルート検索ボタン */}
                  {userLocation && getDirectionsUrl(selectedBrewery) && (
                    <button
                      onClick={() => handleDirectionsClick(selectedBrewery)}
                      style={{
                        display: 'inline-block',
                        padding: '8px 12px',
                        backgroundColor: '#ff6739',
                        color: 'white',
                        textDecoration: 'none',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff8559'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff6739'}
                    >
                      🧭 現在地からのルートを表示
                    </button>
                  )}
                  
                  {!userLocation && (
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#f5f5f5',
                      color: '#444444',
                      borderRadius: '4px',
                      fontSize: '13px',
                      textAlign: 'center'
                    }}>
                      位置情報を取得中...
                    </div>
                  )}

                  {/* 公式サイトとSNSボタン */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {selectedBrewery.url && (
                      
                      <a href={selectedBrewery.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          backgroundColor: '#00a4d6',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          flex: 1,
                          textAlign: 'center'
                        }}
                      >
                        🌐 公式サイト
                      </a>
                    )}
                    {selectedBrewery.SNS && (
                      
                      <a href={selectedBrewery.SNS}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          backgroundColor: '#29dbd2',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          flex: 1,
                          textAlign: 'center'
                        }}
                      >
                        📱 SNS
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}