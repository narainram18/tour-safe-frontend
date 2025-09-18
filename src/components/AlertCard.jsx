import React from "react";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaUser,
  FaClock,
  FaExclamationTriangle,
  FaMapSigns,
  FaHourglassHalf,
  FaRoute,
  FaCheckCircle,
  FaExclamationCircle,
  FaQuestionCircle,
} from "react-icons/fa";
import "./AlertCard.css";

const alertMeta = {
  panic: { icon: <FaExclamationTriangle />, title: "Panic Alert" },
  geo_fence: { icon: <FaMapSigns />, title: "Geo-Fence Breach" },
  inactivity: { icon: <FaHourglassHalf />, title: "Inactivity Alert" },
  route_deviation: { icon: <FaRoute />, title: "Route Deviation" },
};
const defaultMeta = { icon: <FaQuestionCircle />, title: "Unknown Alert" };

const AlertCard = ({ alert, onUpdateStatus }) => {
  const meta = alertMeta[alert.type] || defaultMeta;

  const handleButtonClick = (e, newStatus) => {
    e.preventDefault();
    e.stopPropagation();
    onUpdateStatus(alert.id, newStatus);
  };

  return (
    <Link to={`/tourist/${alert.tourist_id}`} className="alert-card-link">
      <div className={`alert-card ${alert.type} status-${alert.status}`}>
        <div className="alert-card-header">
          <span className="alert-icon">{meta.icon}</span>
          <h3 className="alert-title">{meta.title}</h3>
          <span className="alert-status-badge">{alert.status}</span>
        </div>

        <div className="alert-card-body">
          <div className="info-row">
            <FaUser className="info-icon" />
            <span>
              <b>Tourist:</b>{" "}
              {alert.Tourist?.name || alert.tourist_id.substring(0, 8)}...
            </span>
          </div>
          <div className="info-row">
            <FaClock className="info-icon" />
            <span>{new Date(alert.timestamp).toLocaleString()}</span>
          </div>

          {/* --- THIS IS THE FIX --- */}
          {/* It now checks if lat/lon exist before trying to display them */}
          <div className="info-row">
            <FaMapMarkerAlt className="info-icon" />
            <span>
              <b>Location:</b>{" "}
              {alert.lat != null && alert.lon != null
                ? `${alert.lat.toFixed(4)}, ${alert.lon.toFixed(4)}`
                : "N/A"}
            </span>
          </div>

          {alert.extra?.message && (
            <div className="info-row">
              <span>
                <b>Info:</b> {alert.extra.message}
              </span>
            </div>
          )}
          {alert.type === "geo_fence" && (
            <div className="info-row">
              <span>
                <b>Zone:</b> {alert.extra?.fenceName || "N/A"}
              </span>
            </div>
          )}
        </div>

        <div className="alert-card-actions">
          {(alert.status === "new" || alert.status === "active") && (
            <button
              className="action-btn acknowledge"
              onClick={(e) => handleButtonClick(e, "acknowledged")}
            >
              <FaExclamationCircle /> Acknowledge
            </button>
          )}
          {alert.status === "acknowledged" && (
            <button
              className="action-btn resolve"
              onClick={(e) => handleButtonClick(e, "resolved")}
            >
              <FaCheckCircle /> Resolve
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AlertCard;
