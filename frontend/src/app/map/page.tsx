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
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {selectedBrewery.url && (
                    
                    <a href={selectedBrewery.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 'bold'
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
                        backgroundColor: '#1DA1F2',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}
                    >
                      📱 SNS
                    </a>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}