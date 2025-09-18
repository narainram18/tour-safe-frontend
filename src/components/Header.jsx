import React from "react";
import { FaBell, FaUserCircle, FaBars } from "react-icons/fa";
import "./Header.css";

// The toggleSidebar function will be passed in as a prop
function Header({ toggleSidebar }) {
  return (
    <header className="header">
      <div className="header-left">
        <button onClick={toggleSidebar} className="sidebar-toggle-btn">
          <FaBars />
        </button>
      </div>
      <div className="header-right">
        <span>Welcome, Admin!</span>
        <FaBell className="header-icon" />
        <FaUserCircle className="header-icon" />
      </div>
    </header>
  );
}

export default Header;
