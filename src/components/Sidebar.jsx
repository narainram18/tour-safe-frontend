import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
// Add FaUsers to the import
import { FaTachometerAlt, FaUserPlus, FaUsers } from "react-icons/fa";

function Sidebar({ isCollapsed }) {
  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">{isCollapsed ? "TS" : "TourSafe"}</h1>
      </div>
      <nav>
        <ul>
          <li>
            <NavLink to="/dashboard">
              <FaTachometerAlt className="nav-icon" />
              {!isCollapsed && <span>Alerts Dashboard</span>}
            </NavLink>
          </li>
          {/* --- NEW LINK FOR TOURIST MANAGEMENT --- */}
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
