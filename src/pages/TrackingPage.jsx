import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";

const touristIcon = new Icon(/* ... same as dashboard ... */);

function TrackingPage() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const { shareId } = useParams();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/public/location/${shareId}`
        );
        setLocation(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load location.");
      }
    };
    fetchLocation();
    const interval = setInterval(fetchLocation, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [shareId]);

  if (error)
    return (
      <div className="tracking-container">
        <h1>{error}</h1>
      </div>
    );
  if (!location)
    return (
      <div className="tracking-container">
        <h1>Loading Live Location...</h1>
      </div>
    );

  return (
    <MapContainer
      center={[location.lat, location.lon]}
      zoom={15}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[location.lat, location.lon]} icon={touristIcon}>
        <Popup>
          Tourist's Last Known Location. <br />
          Updated: {new Date(location.timestamp).toLocaleTimeString()}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
export default TrackingPage;
