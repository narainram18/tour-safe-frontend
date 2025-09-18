import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import {
  FaTachometerAlt,
  FaUserPlus,
  FaUsers,
  FaChevronDown,
} from "react-icons/fa";

function Sidebar({ isCollapsed }) {
  const [isAlertsOpen, setAlertsOpen] = useState(true);

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">{isCollapsed ? "TS" : "TourSafe"}</h1>
      </div>
      <nav>
        <ul>
          <li>
            {/* --- CHANGE 1: Main item is now a NavLink to the 'All Alerts' view --- */}
            <NavLink
              to="/dashboard"
              className="dropdown-toggle"
              onClick={() => !isCollapsed && setAlertsOpen(!isAlertsOpen)}
            >
              <FaTachometerAlt className="nav-icon" />
              {!isCollapsed && <span>Alerts Dashboard</span>}
              {!isCollapsed && (
                <FaChevronDown
                  className={`chevron ${isAlertsOpen ? "open" : ""}`}
                />
              )}
            </NavLink>

            {isAlertsOpen && !isCollapsed && (
              <ul className="sub-menu">
                {/* --- CHANGE 2: "All Alerts" link is removed --- */}
                <li>
                  <NavLink to="/dashboard/panic">Panic</NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/geo_fence">Geo-Fence</NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/inactivity">Inactivity</NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/route_deviation">
                    Route Deviation
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
          <li>
            <NavLink to="/tourists">
              <FaUsers className="nav-icon" />
              {!isCollapsed && <span>Manage Tourists</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/register-tourist">
              <FaUserPlus className="nav-icon" />
              {!isCollapsed && <span>Register Tourist</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
