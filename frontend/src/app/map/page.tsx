'use client';

import { useEffect, useState } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import HamburgerMenu from "@/components/HamburgerMenu";
import { 
  canCheckIn, 
  getDistanceToBrewery, 
  formatDistance,
  saveCheckIn,
  getCheckIns,
  CHECKIN_RADIUS,
  type Brewery,
  type UserLocation
} from "@/lib/checkin";

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
  const [locationError, setLocationError] = useState("");
  const [checkedInBreweries, setCheckedInBreweries] = useState<Set<string>>(new Set());
  const [testMode, setTestMode] = useState(
    process.env.NEXT_PUBLIC_TEST_MODE === 'true'
  );

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  useEffect(() => {
    fetch("http://localhost:8000/api/breweries")
      .then(res => res.json())
      .then(data => setBreweries(data));
  }, []);

  useEffect(() => {
    const records = getCheckIns();
    setCheckedInBreweries(new Set(records.map(r => r.breweryId)));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("このブラウザは位置情報に対応していません");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => setLocationError("位置情報の取得に失敗しました")
    );
  }, []);

  const handleCheckIn = (brewery: Brewery) => {
    if (!userLocation) return;

    saveCheckIn({
      breweryId: brewery.id,
      breweryName: brewery.brand,
      timestamp: Date.now(),
      lat: userLocation.lat,
      lng: userLocation.lng,
    });

    setCheckedInBreweries(prev => new Set(prev).add(brewery.id));
  };

  if (loadError) {
    return <div style={{ padding: 20, textAlign: "center" }}>マップの読み込みに失敗しました</div>;
  }

  if (!isLoaded) {
    return <div style={{ padding: 20, textAlign: "center" }}>マップを読み込み中...</div>;
  }

  return (
    <div>
      <HamburgerMenu />

      {/* ===== Header（ロゴ＋タイトル）===== */}
      <header
        style={{
          textAlign: "center",
          padding: "72px 20px 56px",
          background: "linear-gradient(135deg, #ec660dff, #d4d485ff)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <img
            src="/beerHenro_logo.png"
            alt="麦酒遍路"
            style={{
              maxWidth: 280,
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>

        <h1
          style={{
            fontSize: 28,
            fontFamily: '"Noto Serif JP", "Sawarabi Mincho", serif',
            margin: 0,
          }}
        >
          お遍路マップ
        </h1>
      </header>

      {/* ===== マップエリア（白背景）===== */}
      <main style={{ backgroundColor: "#ffffff", padding: "20px 0" }}>
        
        {locationError && (
          <div style={{
            margin: "0 20px 10px",
            padding: 10,
            backgroundColor: "#ffebee",
            color: "#c62828",
            textAlign: "center",
            borderRadius: 4,
          }}>
            {locationError}
          </div>
        )}

        {userLocation && (
          <div style={{
            margin: "0 20px 10px",
            padding: 10,
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            textAlign: "center",
            borderRadius: 4,
          }}>
            📍 現在地を取得しました
          </div>
        )}

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={8}
        >
          {userLocation && (
            <Marker
              position={userLocation}
              title="現在地"
            />
          )}

          {breweries.map(brewery => (
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
              <div style={{ minWidth: 240 }}>
                <h3 style={{ marginTop: 0 }}>{selectedBrewery.brand}</h3>

                {userLocation &&
                  canCheckIn(userLocation, selectedBrewery) &&
                  !checkedInBreweries.has(selectedBrewery.id) && (
                    <button
                      style={{
                        width: "100%",
                        padding: 8,
                        backgroundColor: "#66ca23",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      onClick={() => handleCheckIn(selectedBrewery)}
                    >
                      ✅ チェックインする（{CHECKIN_RADIUS}m以内）
                    </button>
                  )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </main>
    </div>
  );
}
