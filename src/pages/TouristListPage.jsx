import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import debounce from "lodash.debounce";
import "./TouristListPage.css";

function TouristListPage() {
  const [tourists, setTourists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchTourists = async (searchQuery) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:3000/api/tourists", {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchQuery },
      });
      setTourists(response.data);
    } catch (error) {
      console.error("Failed to fetch tourists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchTourists, 300), []);

  useEffect(() => {
    debouncedFetch(searchTerm);
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchTerm, debouncedFetch]);

  return (
    <div className="tourist-list-container">
      <h1 className="page-title">Tourist Management</h1>
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by name or phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone Number</th>
              <th>KYC Type</th>
              <th>KYC Data</th>
              <th>Last Seen</th>
              <th>Registered On</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="loading-cell">
                  Loading tourists...
                </td>
              </tr>
            ) : tourists.length > 0 ? (
              tourists.map((tourist) => (
                <tr
                  key={tourist.id}
                  onClick={() => navigate(`/tourist/${tourist.id}`)}
                >
                  <td>{tourist.name}</td>
                  <td>{tourist.phone}</td>
                  <td>{tourist.kyc_type}</td>
                  <td>{tourist.kyc_data}</td>
                  <td>
                    {tourist.last_seen_at
                      ? new Date(tourist.last_seen_at).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>{new Date(tourist.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results-cell">
                  No tourists found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TouristListPage;
