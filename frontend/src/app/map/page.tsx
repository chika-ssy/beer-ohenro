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
};

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

  useEffect(() => {
    fetch("http://localhost:8000/api/breweries")
      .then((res) => res.json())
      .then((data) => setBreweries(data))
      .catch((err) => console.error("Error fetching breweries:", err));
  }, []);

  return (
    <div>
      <h1 style={{ padding: '20px', textAlign: 'center' }}>麦酒遍路 - ブルワリーマップ</h1>
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={8}>
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
              <div style={{ padding: '10px' }}>
                <a 
                  href={selectedBrewery.url} // URLを設定
                  target="_blank" // 新しいタブで開く
                  rel="noopener noreferrer" // セキュリティ対策
                  style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#333',
                      textDecoration: selectedBrewery.url ? 'underline' : 'none', // URLがあれば下線
                      cursor: selectedBrewery.url ? 'pointer' : 'default', // URLがあればポインター
                      display: 'block'
                    }}>
                  {selectedBrewery.brand}
                </a>
                <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 500, color: '#333'}}>
                  <strong>パブ:</strong> {selectedBrewery.pub}
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 500, color: '#333'}}>
                  <strong>住所:</strong> {selectedBrewery.address}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}