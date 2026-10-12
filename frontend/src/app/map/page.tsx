'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useSession } from "next-auth/react";
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
  const { status, data: session } = useSession();
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation>(null);
  const [locationError, setLocationError] = useState("");
  const [checkedInBreweries, setCheckedInBreweries] = useState<Set<string>>(new Set());
  const [testMode] = useState(
    process.env.NEXT_PUBLIC_TEST_MODE === "true"
  );

  useEffect(() => {
    // 1. fetchのURLを絶対パスから「相対パス」に変更
    fetch('/api/breweries')
      .then(res => {
        if (!res.ok) throw new Error('データ取得に失敗しました');
        return res.json();
      })
      .then(data => {
        // 2. データの緯度・経度が文字列の場合に備えて数値に変換（安全策）
        const formattedData = data.map((b: any) => ({
          ...b,
          lat: Number(b.lat),
          lng: Number(b.lng)
        }));
        setBreweries(formattedData);
      })
      .catch(err => console.error("ブルワリーデータの取得に失敗:", err));
  }, []);


  useEffect(() => {
    let cancelled = false;

    const loadCheckIns = async () => {
      if (status === "loading") return;

      // ログアウト中はチェックイン状態をリセット
      if (status !== "authenticated") {
        setCheckedInBreweries(new Set());
        return;
      }

      // 前のユーザーの履歴をいったん消す
      setCheckedInBreweries(new Set());

      try {
        const records = await getCheckIns();

        if (!cancelled) {
          setCheckedInBreweries(
            new Set(records.map(r => r.breweryId))
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error("チェックイン履歴の取得に失敗:", err);
        }
      }
    };

    loadCheckIns();

    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id]);


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
        setLocationError("");
      },
      () => setLocationError("位置情報の取得に失敗しました")
    );
  }, []);

  const handleCheckIn = async (brewery: Brewery) => { // asyncを追加
    if (!userLocation) return;

    const ok = window.confirm(
      `🍺 「${brewery.brand}」にチェックインしますか?\n\nこの記録はDBに保存されます。`
    );
    if (!ok) return;

    try {
      await saveCheckIn({ // awaitを追加
        breweryId: brewery.id,
        breweryName: brewery.brand,
        timestamp: Date.now(),
        lat: userLocation.lat,
        lng: userLocation.lng,
      });

      setCheckedInBreweries(prev => new Set(prev).add(brewery.id));
      alert(`✅ チェックイン完了!\n${brewery.brand}`);
    } catch (err) {
      alert("チェックインに失敗しました。");
    }
  };

  const handleDirectionsClick = (brewery: Brewery) => {
    if (!userLocation) return;
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const dest = `${brewery.lat},${brewery.lng}`;
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleAddressClick = (address: string) => {
    const encoded = encodeURIComponent(address);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
    window.open(mapUrl, "_blank", "noopener,noreferrer");
  };

  const setTestLocation = (brewery: Brewery) => {
    if (process.env.NEXT_PUBLIC_TEST_MODE !== "true") return;
    const offset = 0.0005;
    setUserLocation({
      lat: brewery.lat + offset,
      lng: brewery.lng + offset,
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", position: "relative" }}>
      <HamburgerMenu />
      <header
        style={{
          textAlign: "center",
          padding: "72px 20px 40px",
          background: "linear-gradient(135deg, #ec660dff, #d4d485ff)",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >

          <Link href="/" aria-label="麦酒遍路のホームへ">
            <img
              src="/beerHenro_logo.png"
              alt="麦酒遍路"
              style={{ maxWidth: "280px", width: "100%", height: "auto" }}
            />
          </Link>

        </div>
        <p style={{ opacity: 0.9, fontSize: "18px", margin: 0 }}>
          🗺️ ブルワリーマップ
        </p>
      </header>

      <main style={{ backgroundColor: "#fff", padding: "40px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {locationError && (
            <div
              style={{
                textAlign: "center",
                color: "#c62828",
                padding: "16px",
                marginBottom: "16px",
                background: "#ffebee",
                borderRadius: "8px",
              }}
            >
              {locationError}
            </div>
          )}

          {userLocation && (
            <div
              style={{
                textAlign: "center",
                color: "#27ae60",
                padding: "12px",
                marginBottom: "16px",
                background: "#e8f5e9",
                borderRadius: "8px",
              }}
            >
              📍 現在地を取得しました
            </div>
          )}

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            {loadError ? (
              <p>Google Mapsの読み込みに失敗しました。</p>
            ) : !isLoaded ? (
              <p>地図を読み込み中...</p>
            ) : (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={8}
              >
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      fillColor: "#4285F4",
                      fillOpacity: 1,
                      strokeColor: "#fff",
                      strokeWeight: 2,
                    }}
                  />
                )}

                {breweries.map(brewery => {
                  const visited = checkedInBreweries.has(brewery.id);
                  return (
                    <Marker
                      key={brewery.id}
                      position={{ lat: brewery.lat, lng: brewery.lng }}
                      onClick={() => {
                        if (testMode) setTestLocation(brewery);
                        setSelectedBrewery(brewery);
                      }}
                      icon={
                        visited
                          ? {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#27ae60",
                            fillOpacity: 1,
                            strokeColor: "#fff",
                            strokeWeight: 2,
                          }
                          : undefined
                      }
                    />
                  );
                })}

                {selectedBrewery && (
                  <InfoWindow
                    position={{
                      lat: selectedBrewery.lat,
                      lng: selectedBrewery.lng,
                    }}
                    onCloseClick={() => setSelectedBrewery(null)}
                  >
                    <div style={{
                      padding: "6px 16px",
                      minWidth: "260px",
                      maxWidth: "320px",
                      backgroundColor: "#ffffff",
                      color: "#2c2c2c",
                      fontSize: "14px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px", paddingBottom: "12px", borderBottom: "2px solid #f0f0f0" }}>
                        <span style={{ fontSize: "24px", marginRight: "10px" }}>🍺</span>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold", color: "#2c2c2c" }}>
                          {selectedBrewery.brand}
                        </h3>
                      </div>

                      {selectedBrewery.pub && (
                        <p style={{ margin: "6px 0", color: "#666" }}>
                          <strong>パブ:</strong> {selectedBrewery.pub}
                        </p>
                      )}

                      <p style={{ margin: "6px 0" }}>
                        <span style={{ color: "#ff652f" }}>📍 </span>
                        <a onClick={() => handleAddressClick(selectedBrewery.address)} style={{ color: "#2196F3", textDecoration: "underline", cursor: "pointer" }}>
                          {selectedBrewery.address}
                        </a>
                      </p>

                      {userLocation && (
                        <div style={{ padding: "6px", borderRadius: "6px", marginTop: "10px", marginBottom: "10px", background: "#f5f5f5", textAlign: "center", fontSize: "13px", color: "#666" }}>
                          📏 現在地から約 {formatDistance(getDistanceToBrewery(userLocation, selectedBrewery) || 0)}
                        </div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                        {status === "unauthenticated" && (
                          <p style={{ color: "#666", textAlign: "center" }}>
                            🍺 チェックインするにはログインが必要です
                          </p>
                        )}

                        {status === "authenticated" &&
                          userLocation &&
                          canCheckIn(userLocation, selectedBrewery) &&
                          !checkedInBreweries.has(selectedBrewery.id) && (
                            <button
                              onClick={() => handleCheckIn(selectedBrewery)}
                              style={{ width: "100%", padding: "10px", backgroundColor: "#27ae60", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}
                            >
                              ✅ チェックインする
                            </button>
                          )}

                        {checkedInBreweries.has(selectedBrewery.id) && (
                          <div style={{ padding: "10px", backgroundColor: "#e8f5e9", color: "#27ae60", borderRadius: "6px", fontWeight: "bold", textAlign: "center", border: "1px solid #27ae60" }}>
                            ✓ チェックイン済み
                          </div>
                        )}

                        {userLocation && (
                          <button
                            onClick={() => handleDirectionsClick(selectedBrewery)}
                            style={{ width: "100%", padding: "10px", backgroundColor: "#ff652f", color: "white", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}
                          >
                            🧭 ルートを表示
                          </button>
                        )}

                        <div style={{ display: "flex", gap: "8px" }}>
                          {selectedBrewery.url && (
                            <a href={selectedBrewery.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "8px", backgroundColor: "#3498DB", color: "white", borderRadius: "6px", textAlign: "center", fontWeight: "bold", textDecoration: "none", fontSize: "12px" }}>
                              🌐 公式
                            </a>
                          )}
                          {selectedBrewery.SNS && (
                            <a href={selectedBrewery.SNS} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "8px", backgroundColor: "#1ABC9C", color: "white", borderRadius: "6px", textAlign: "center", fontWeight: "bold", textDecoration: "none", fontSize: "12px" }}>
                              📱 SNS
                            </a>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedBrewery(null)}
                          style={{
                            marginTop: "4px",
                            width: "100%",
                            padding: "8px",
                            backgroundColor: "#eee",
                            color: "#666",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            cursor: "pointer"
                          }}
                        >
                          閉じる
                        </button>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </div>
        </div>
      </main>

      <footer
        style={{
          padding: "40px 20px",
          textAlign: "center",
          color: "#999",
          fontSize: "13px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <img
          src="/icon_hop.png"
          alt="ホップ"
          style={{
            width: "40px",
            height: "40px",
            opacity: 0.6,
          }}
        />
        <p style={{ margin: 0 }}>© 2025 麦酒遍路</p>
      </footer>
    </div>
  );
}