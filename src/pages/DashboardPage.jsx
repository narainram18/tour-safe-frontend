import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";
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
});

function DashboardPage() {
  const [alerts, setAlerts] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [liveLocations, setLiveLocations] = useState({});
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { alertType } = useParams();
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");
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
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to load dashboard data.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const ws = new WebSocket("ws://localhost:3000");
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "ALERT_NEW") {
        setAlerts((prev) => [message.payload, ...prev]);
      }
      if (message.type === "ALERT_UPDATE") {
        setAlerts((prev) =>
          prev.map((a) => (a.id === message.payload.id ? message.payload : a))
        );
      }
      if (message.type === "LOCATION_UPDATE") {
        setLiveLocations((prev) => ({
          ...prev,
          [message.payload.touristId]: message.payload,
        }));
      }
    };
    return () => ws.close();
  }, [navigate]);

  // --- THIS IS THE FIX ---
  // This effect runs once after the component mounts and tells the map to resize.
  useEffect(() => {
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
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
  if (error) {
    return <div className="loading-container">{error}</div>;
  }

  const sortedAlerts = [...alerts].sort((a, b) => {
    const statusOrder = { new: 1, active: 1, acknowledged: 2, resolved: 3 };
    return (
      statusOrder[a.status] - statusOrder[b.status] ||
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  });

  const panicAlerts = sortedAlerts.filter((a) => a.type === "panic");
  const geoFenceAlerts = sortedAlerts.filter((a) => a.type === "geo_fence");
  const inactivityAlerts = sortedAlerts.filter((a) => a.type === "inactivity");
  const routeDeviationAlerts = sortedAlerts.filter(
    (a) => a.type === "route_deviation"
  );

  const alertsToDisplay =
    {
      panic: panicAlerts,
      geo_fence: geoFenceAlerts,
      inactivity: inactivityAlerts,
      route_deviation: routeDeviationAlerts,
    }[alertType] || [];

  return (
    <div className="dashboard-layout">
      {alertType ? (
        <div className="alerts-panel single-view">
          <div className="panel-section">
            <h2 className="panel-title">
              {alertType.replace("_", " ")} Alerts ({alertsToDisplay.length})
            </h2>
            <div className="alerts-container">
              {alertsToDisplay.length > 0 ? (
                alertsToDisplay.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onUpdateStatus={handleUpdateAlertStatus}
                  />
                ))
              ) : (
                <p className="no-alerts-message">
                  No active alerts of this type.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard-summary">
          <h1>Welcome to TourSafe</h1>
          <p>Select an alert category from the sidebar to view details.</p>
          <div className="stats-container">
            <div className="stat-card">
              <span>{panicAlerts.length}</span> Panic Alerts
            </div>
            <div className="stat-card">
              <span>{geoFenceAlerts.length}</span> Geo-Fence Alerts
            </div>
            <div className="stat-card">
              <span>{inactivityAlerts.length}</span> Inactivity Alerts
            </div>
            <div className="stat-card">
              <span>{routeDeviationAlerts.length}</span> Route Deviation Alerts
            </div>
          </div>
        </div>
      )}

      <div className="map-view">
        <MapContainer
          ref={mapRef}
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {geofences.map((fence) => {
            if (!fence?.polygon_geojson?.coordinates?.[0]?.length) {
              return null;
            }
            return (
              <Polygon
                key={fence.id}
                pathOptions={{
                  color: getZoneColor(fence.risk_level),
                  fillOpacity: 0.2,
                }}
                positions={fence.polygon_geojson.coordinates[0].map((p) => [
                  p[1],
                  p[0],
                ])}
              >
                <Popup>
                  {fence.name}
                  <br />
                  Risk Level: {fence.risk_level}
                </Popup>
              </Polygon>
            );
          })}

          {alerts.map((alert) => {
            if (alert.lat == null || alert.lon == null) {
              return null;
            }
            return (
              <Marker key={alert.id} position={[alert.lat, alert.lon]}>
                <Popup>
                  <b>{alert.type.replace("_", " ").toUpperCase()} ALERT</b>
                  <br />
                  Tourist: {alert.Tourist?.name}
                  <br />
                  <button onClick={() => handleDownloadFir(alert.id)}>
                    Generate E-FIR
                  </button>
                </Popup>
              </Marker>
            );
          })}

          {Object.values(liveLocations).map((loc) => (
            <Marker
              key={loc.touristId}
              position={[loc.lat, loc.lon]}
              icon={touristIcon}
            >
              <Popup>
                <b>Live Location</b>
                <br />
                Tourist ID: {loc.touristId.substring(0, 8)}...
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default DashboardPage;
