import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "./TouristDetailsPage.css";

function TouristDetailsPage() {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { touristId } = useParams(); // Get the ID from the URL

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `http://localhost:3000/api/tourists/${touristId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDetails(response.data);
      } catch (error) {
        console.error("Failed to fetch tourist details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [touristId]);

  if (isLoading)
    return <div className="loading-container">Loading Tourist Details...</div>;
  if (!details)
    return <div className="loading-container">Tourist not found.</div>;

  const { tourist, alerts } = details;
  const mapCenter =
    alerts.length > 0 ? [alerts[0].lat, alerts[0].lon] : [20.5937, 78.9629];

  return (
    <div className="details-page-layout">
      <div className="profile-panel">
        <h2 className="panel-title">{tourist.name}</h2>
        <div className="profile-info">
          <p>
            <strong>Phone:</strong> {tourist.phone}
          </p>
          <p>
            <strong>KYC:</strong> {tourist.kyc_type} - {tourist.kyc_data}
          </p>
          <p>
            <strong>Itinerary:</strong> {tourist.itinerary?.details || "N/A"}
          </p>
          <p>
            <strong>Registered:</strong>{" "}
            {new Date(tourist.created_at).toLocaleString()}
          </p>
          <p>
            <strong>Blockchain ID:</strong>{" "}
            {tourist.blockchain_tx_hash?.substring(0, 15)}...
          </p>
        </div>
        <hr />
        <h3 className="panel-title">Alert History ({alerts.length})</h3>
        <ul className="alert-history-list">
          {alerts.map((alert) => (
            <li key={alert.id}>
              {alert.type.toUpperCase()} at{" "}
              {new Date(alert.timestamp).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>
      <div className="map-view-details">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {alerts.map((alert) => (
            <Marker key={alert.id} position={[alert.lat, alert.lon]}>
              <Popup>{alert.type.toUpperCase()} Alert</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default TouristDetailsPage;
