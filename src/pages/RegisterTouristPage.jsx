import React, { useState } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import "./RegisterTouristPage.css";

function RegisterTouristPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "password123", // Default password for on-spot registration
    kycType: "Aadhaar",
    kycData: "",
    itinerary: "",
    visitFrom: "",
    visitTo: "",
  });
  const [registrationResult, setRegistrationResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setRegistrationResult(null);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        kycType: formData.kycType,
        kycData: formData.kycData,
        itinerary: {
          places: formData.itinerary,
          from: formData.visitFrom,
          to: formData.visitTo,
        },
        emergencyContacts: [],
      };

      const response = await axios.post(
        "http://localhost:3000/api/register",
        payload
      );
      setRegistrationResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <h2 className="form-title">On-Spot Tourist Registration</h2>

        {!registrationResult ? (
          <form onSubmit={handleRegister}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>KYC Type</label>
                <select
                  name="kycType"
                  value={formData.kycType}
                  onChange={handleChange}
                >
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
              <div className="form-group">
                <label>{formData.kycType} Number</label>
                <input
                  type="text"
                  name="kycData"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Visit From Date</label>
                <input
                  type="date"
                  name="visitFrom"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Visit To Date</label>
                <input
                  type="date"
                  name="visitTo"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Places (e.g., Chennai to Agra)</label>
                <input
                  type="text"
                  name="itinerary"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Registering..." : "Generate Digital ID"}
            </button>
            {error && <p className="error-message">{error}</p>}
          </form>
        ) : (
          <div className="qr-container">
            <h3>Registration Successful!</h3>
            <p>
              <strong>Tourist ID:</strong> {registrationResult.touristId}
            </p>
            <QRCodeSVG
              value={JSON.stringify({
                touristId: registrationResult.touristId,
                txId: registrationResult.blockchainTxId,
              })}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"L"}
              includeMargin={true}
            />
            <button
              onClick={() => setRegistrationResult(null)}
              className="submit-btn"
            >
              Register Another Tourist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterTouristPage;
