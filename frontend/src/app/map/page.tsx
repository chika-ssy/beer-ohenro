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

  // 住所クリック時の処理
  const handleAddressClick = (address: string) => {
    const confirmed = window.confirm(
      `Google Mapsで「${address}」の場所を開きますか？`
    );
    if (!confirmed) return;

    const encoded = encodeURIComponent(address);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
    window.open(mapUrl, "_blank", "noopener,noreferrer");
  };

  // ルート表示クリック時の処理
  const handleDirectionsClick = (brewery: Brewery) => {
    if (!userLocation) return;

    const origin = `${userLocation.lat},${userLocation.lng}`;
    const dest = `${brewery.lat},${brewery.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;

    const ok = window.confirm(
      `Google Mapsで「${brewery.brand}」までのルートを表示しますか？`
    );
    if (ok) window.open(url, "_blank", "noopener,noreferrer");
  };

  // Google Maps Directionsへのリンクを生成
  const getDirectionsUrl = (brewery: Brewery) => {
    if (!userLocation) return null;
    
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${brewery.lat},${brewery.lng}`;
    
    // Google Maps Directionsの基本URL
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  };

  return (
    <div>
      <h1 style={{ padding: '20px', textAlign: 'center', fontSize:'30px', fontWeight: 'bold' }}>麦酒遍路 - ブルワリーマップ</h1>
      
      {locationError && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          textAlign: 'center',
          margin: '0 20px 10px 20px',
          borderRadius: '4px'
        }}>
          {locationError}
        </div>
      )}
      
      {userLocation && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: 'rgba(65, 255, 163, 0.18)', 
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: '#b0e6b3ff',
          textAlign: 'center',
          margin: '0 20px 10px 20px',
          borderRadius: '4px'
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
              <div
                style={{
                  padding: "16px", 
                  minWidth: "280px",
                  borderRadius: "12 px",
                  background: "rgba(15, 18, 22, 0.7)",   // 半透明ダーク
                  border: "1px solid rgba(255, 255, 255, 0.1)", // 枠線
                  backdropFilter: "blur(6px)",            // 背景ぼかし
                  WebkitBackdropFilter: "blur(6px)",
                  boxShadow: `
                    0 12px 28px rgba(0, 0, 0, 0.55),
                    0 0 0 1px rgba(255,255,255,0.04)
                  `, // 強めの影
                  color: "#ECF0F1",
                }}
              >
                {/* タイトル部分 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0)",
                    paddingBottom: "10px",
                  }}
                >
                  <span style={{ fontSize: "28px", marginRight: "10px" }}>🍺</span>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>
                    {selectedBrewery.brand}
                  </h2>
                </div>

                {/* パブ情報 */}
                <p style={{ margin: "6px 0", opacity: 0.85 }}>
                  <strong>パブ:</strong> {selectedBrewery.pub || "[パブなし]"}
                </p>

                {/* 住所クリックでGoogleMaps */}
                <p style={{ margin: "6px 0", opacity: 0.9 }}>
                  <span style={{ color: "#ffdd57" }}>📍 </span>
                  <a
                    onClick={() => handleAddressClick(selectedBrewery.address)}
                    style={{
                      color: "#ECF0F1",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    {selectedBrewery.address}
                  </a>
                </p>

                {/* ボタンエリア */}
                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                
                  {/* 現在地からのルート */}
                  {userLocation && getDirectionsUrl(selectedBrewery) && (
                    <button
                      onClick={() => handleDirectionsClick(selectedBrewery)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: "#ff652f",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "15px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#ff7f50")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#ff652f")
                      }
                    >
                      🧭 現在地からのルートを表示
                    </button>
                  )}

                  {/* 公式サイト & SNS */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    {selectedBrewery.url && (
                      <a
                        href={selectedBrewery.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          backgroundColor: "#3498DB",
                          color: "white",
                          borderRadius: "6px",
                          textAlign: "center",
                          fontWeight: "bold",
                          transition: "0.2s",
                        }}
                      >
                        🌐 公式サイト
                      </a>
                    )}
                    {selectedBrewery.SNS && (
                      <a
                        href={selectedBrewery.SNS}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          backgroundColor: "#1ABC9C",
                          color: "white",
                          borderRadius: "6px",
                          textAlign: "center",
                          fontWeight: "bold",
                          transition: "0.2s",
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