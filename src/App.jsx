import React, { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RegisterTouristPage from "./pages/RegisterTouristPage";
import TouristDetailsPage from "./pages/TouristDetailsPage";
import TouristListPage from "./pages/TouristListPage"; // <-- IMPORT NEW PAGE
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import "./App.css";

const PrivateRoutes = () => {
  return localStorage.getItem("authToken") ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
};

const MainLayout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="app-container">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="content-wrapper">
        <Header toggleSidebar={toggleSidebar} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoutes />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/register-tourist" element={<RegisterTouristPage />} />
            <Route
              path="/tourist/:touristId"
              element={<TouristDetailsPage />}
            />

            {/* --- ADD ROUTE FOR NEW PAGE --- */}
            <Route path="/tourists" element={<TouristListPage />} />
            <Route path="/dashboard/:alertType?" element={<DashboardPage />} />

            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
