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
    
    const handleAddressClick = (address: string) => {
      const confirmed = window.confirm(
        `Google Mapsで「${address}」の場所を開きますか？`
      );
      if (!confirmed) return;

      const encoded = encodeURIComponent(address);
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
      window.open(mapUrl, "_blank", "noopener,noreferrer");
    };

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


    // Google Maps Directionsの基本URL
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  };

  return (
    <div>
      <h1 style={{ padding: '20px', textAlign: 'center' }}>麦酒遍路 - ブルワリーマップ</h1>
      
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
          backgroundColor: '#e8f5e9', 
          color: '#2e7d32',
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
              <div>
                <div
                  style={{
                    padding: '20px',
                    minWidth: '280px',
                    backgroundColor: '#2C3E50',
                    color: '#ECF0F1',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  <h2
                    style={{
                      margin: '0 0 10px 0',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                      paddingBottom: '10px',
                    }}
                  >
                    <span style={{ fontSize: '24px', marginRight: '8px' }}>🍺</span>
                    {selectedBrewery.brand}
                  </h2>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: '#BDC3C7' }}>
                      <strong>パブ:</strong> {selectedBrewery.pub || '[パブなし]'}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#BDC3C7' }}>
                      <span style={{ color: '#E74C3C' }}>📍 </span>
                      <a
                        onClick={() => handleAddressClick(selectedBrewery.address)}
                        style={{
                          color: '#BDC3C7',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                        }}
                      >
                        {selectedBrewery.address}
                      </a>
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      marginTop: '15px',
                    }}
                  >
                    {userLocation && getDirectionsUrl(selectedBrewery) ? (
                      <button
                        onClick={() => handleDirectionsClick(selectedBrewery)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px 15px',
                          backgroundColor: '#E67E22',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = '#d35400')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = '#E67E22')
                        }
                      >
                        ➡️ 現在地からのルートを表示
                      </button>
                    ) : (
                      <div
                        style={{
                          padding: '10px 15px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#BDC3C7',
                          borderRadius: '4px',
                          fontSize: '14px',
                          textAlign: 'center',
                        }}
                      >
                        位置情報を取得中...
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {selectedBrewery.url && (
                        <a
                          href={selectedBrewery.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px 12px',
                            backgroundColor: '#3498DB',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            flex: 1,
                            textAlign: 'center',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = '#2980b9')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = '#3498DB')
                          }
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px 12px',
                            backgroundColor: '#1ABC9C',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            flex: 1,
                            textAlign: 'center',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = '#16a085')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = '#1ABC9C')
                          }
                        >
                          📱 SNS
                        </a>
                      )}
                    </div>
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