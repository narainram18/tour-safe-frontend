import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { Icon } from "leaflet";
import AlertCard from "../components/AlertCard";
import "./DashboardPage.css";

const getZoneColor = (riskLevel) => {
  if (riskLevel > 7) return "red";
  if (riskLevel > 4) return "yellow";
  return "green";
};

const touristIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
  className: "live-tourist-marker",
});

function DashboardPage() {
  const [alerts, setAlerts] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [liveLocations, setLiveLocations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const mapCenter = [20.5937, 78.9629];
  const navigate = useNavigate();
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const [alertsResponse, geofencesResponse] = await Promise.all([
          axios.get("http://localhost:3000/api/alerts", { headers }),
          axios.get("http://localhost:3000/api/geofences", { headers }),
        ]);
        setAlerts(alertsResponse.data);
        setGeofences(geofencesResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        if (error.response && [401, 403].includes(error.response.status)) {
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);

    const ws = new WebSocket("ws://localhost:3000");
    ws.onopen = () => console.log("WebSocket connected");
    ws.onclose = () => console.log("WebSocket disconnected");
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "LOCATION_UPDATE") {
        const { touristId, lat, lon } = message.payload;
        setLiveLocations((prev) => ({ ...prev, [touristId]: { lat, lon } }));
      }

      if (message.type === "ALERT_UPDATE") {
        const updatedAlert = message.payload;
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert.id === updatedAlert.id ? updatedAlert : alert
          )
        );
      }
    };

    return () => {
      clearInterval(intervalId);
      ws.close();
    };
  }, [navigate]);

  useEffect(() => {
    setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 100);
  }, []);

  const handleUpdateAlertStatus = async (alertId, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.patch(
        `http://localhost:3000/api/alerts/${alertId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Failed to update alert status:", error);
      alert("Could not update the alert status. Please try again.");
    }
  };

  const handleDownloadFir = (alertId) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      window.open(
        `http://localhost:3000/api/alerts/${alertId}/download-e-fir?token=${token}`
      );
    }
  };

  if (isLoading) {
    return <div className="loading-container">Loading Dashboard...</div>;
  }

  const sortedAlerts = [...alerts].sort((a, b) => {
    const statusOrder = { new: 1, acknowledged: 2, resolved: 3 };
    if (statusOrder[a.status] < statusOrder[b.status]) return -1;
    if (statusOrder[a.status] > statusOrder[b.status]) return 1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  const panicAlerts = sortedAlerts.filter((a) => a.type === "panic");
  const geoFenceAlerts = sortedAlerts.filter((a) => a.type === "geo_fence");
  const inactivityAlerts = sortedAlerts.filter((a) => a.type === "inactivity");

  const renderAlerts = (alertList) => {
    return alertList.length > 0 ? (
      alertList.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onUpdateStatus={handleUpdateAlertStatus}
        />
      ))
    ) : (
      <p className="no-alerts-message">No active alerts of this type.</p>
    );
  };

  return (
    <div className="dashboard-layout">
      <div className="alerts-panel">
        <div className="panel-section">
          <h2 className="panel-title">
            Inactivity Alerts ({inactivityAlerts.length})
          </h2>
          <div className="alerts-container">
            {renderAlerts(inactivityAlerts)}
          </div>
        </div>
        <div className="panel-section">
          <h2 className="panel-title">
            Geo-Fence Alerts ({geoFenceAlerts.length})
          </h2>
          <div className="alerts-container">{renderAlerts(geoFenceAlerts)}</div>
        </div>
        <div className="panel-section">
          <h2 className="panel-title">Panic Alerts ({panicAlerts.length})</h2>
          <div className="alerts-container">{renderAlerts(panicAlerts)}</div>
        </div>
      </div>

      {/* --- THIS IS THE MAP SECTION THAT WAS MISSING --- */}
      <div className="map-view">
        <MapContainer
          ref={mapRef}
          center={mapCenter}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {geofences.map((fence) => {
            const positions = fence.polygon_geojson.coordinates[0].map((p) => [
              p[1],
              p[0],
            ]);
            return (
              <Polygon
                key={fence.id}
                pathOptions={{
                  color: getZoneColor(fence.risk_level),
                  fillOpacity: 0.2,
                }}
                positions={positions}
              >
                <Popup>
                  {fence.name}
                  <br />
                  Risk Level: {fence.risk_level}
                </Popup>
              </Polygon>
            );
          })}

          {alerts.map((alert) => (
            <Marker key={alert.id} position={[alert.lat, alert.lon]}>
              <Popup>
                <b>{alert.type.toUpperCase().replace("_", " ")} Alert</b>
                <br />
                Tourist:{" "}
                {alert.Tourist?.name || alert.tourist_id.substring(0, 8)}...
                <br />
                <button onClick={() => handleDownloadFir(alert.id)}>
                  Generate E-FIR
                </button>
              </Popup>
            </Marker>
          ))}

          {Object.entries(liveLocations).map(([touristId, location]) => (
            <Marker
              key={`live-${touristId}`}
              position={[location.lat, location.lon]}
              icon={touristIcon}
            >
              <Popup>
                <b>Live Location</b>
                <br />
                Tourist ID: {touristId.substring(0, 8)}...
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default DashboardPage;
