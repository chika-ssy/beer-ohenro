import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

type Brewery = {
  id: string;
  brand: string;
  pub: string;
  company: string;
  address: string;
  lat: number;
  lng: number;
};

const containerStyle = {
  width: "100%",
  height: "600px",
};

const center = {
  lat: 33.5597, // 四国の中央あたり（高松市）
  lng: 133.5311,
};

export default function MapPage() {
  const [breweries, setBreweries] = useState<Brewery[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/breweries")
      .then((res) => res.json())
      .then((data) => setBreweries(data));
  }, []);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={8}>
        {breweries.map((brewery) => (
          <Marker
            key={brewery.id}
            position={{ lat: brewery.lat, lng: brewery.lng }}
            title={brewery.brand}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}