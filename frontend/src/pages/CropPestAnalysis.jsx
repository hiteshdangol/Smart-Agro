import React, { useState } from "react";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance";
import "../styles/CropPestAnalysis.css";

const TABS = [
  { key: "pest", label: "Pest Risk", icon: "🐛" },
  { key: "crop", label: "Crop Recommendation", icon: "🌱" },
];

/* ── Pest Risk Tab ── */
function PestTab() {
  const [form, setForm] = useState({
    temp_avg: 26,
    humidity: 81,
    rainfall_mm: 242,
    crop_type: "Tomato",
    growth_stage: "Vegetative",
    prev_pest_incidence: 0.1,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await axios.post("http://localhost:5000/api/pest-alert/pest-risk", form);
      if (data && data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to get prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cpa-tab-content">
      <div className="cpa-form-card">
        <h3>Enter Crop Parameters</h3>
        <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
          {Object.keys(form).map((key) => (
            <div className="cpa-field" key={key}>
              <label>{key.replace(/_/g, " ").toUpperCase()}:</label>
              {key === "crop_type" ? (
                <select name={key} value={form[key]} onChange={handleChange}>
                  <option value="Tomato">Tomato</option>
                  <option value="Maize">Maize</option>
                  <option value="Potato">Potato</option>
                </select>
              ) : key === "growth_stage" ? (
                <select name={key} value={form[key]} onChange={handleChange}>
                  <option value="Seedling">Seedling</option>
                  <option value="Vegetative">Vegetative</option>
                  <option value="Flowering">Flowering</option>
                  <option value="Fruiting">Fruiting</option>
                </select>
              ) : (
                <input
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  type="number"
                  step="0.1"
                  min={key === "temp_avg" ? "-50" : key === "prev_pest_incidence" ? "0" : "0"}
                  max={key === "temp_avg" ? "50" : key === "humidity" ? "100" : key === "rainfall_mm" ? "500" : key === "prev_pest_incidence" ? "1" : undefined}
                  required
                />
              )}
            </div>
          ))}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Predicting..." : "Predict Risk"}
          </button>
        </form>
      </div>

      {error && (
        <div className="cpa-result-card">
          <p className="cpa-error">Error: {error}</p>
        </div>
      )}
      {result && (
        <div className="cpa-result-card">
          <h3>Prediction Result</h3>
          <div className={`cpa-risk-badge ${(result.risk_level || "").toLowerCase().replace(/\s/g, "-")}`}>
            {result.risk_level}
          </div>
          <p>Risk assessment for your crops</p>
        </div>
      )}
    </div>
  );
}

/* ── Crop Recommendation Tab ── */
function CropTab() {
  const [formData, setFormData] = useState({
    N: 78, P: 42, K: 45, temperature: 26, humidity: 81, ph: 6.5, rainfall: 242,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const sanitizeNumber = (value) => value.replace(/^(-)?0+(?=\d)/, "$1");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: sanitizeNumber(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);
    try {
      const payload = Object.fromEntries(
        Object.entries(formData).map(([key, val]) => [key, parseFloat(val)])
      );
      const response = await axios.post("http://localhost:5000/api/crop-recommendation/recommend", payload);
      setResult(response.data);
      try {
        await axiosInstance.post("/records", {
          type: "recommendation",
          soilParams: { N: parseFloat(formData.N), P: parseFloat(formData.P), K: parseFloat(formData.K), ph: parseFloat(formData.ph) },
          climateParams: { temperature: parseFloat(formData.temperature), humidity: parseFloat(formData.humidity), rainfall: parseFloat(formData.rainfall) },
          recommendedCrop: response.data.recommendation.predicted_crop,
          recommendationConfidence: response.data.recommendation.confidence,
          recommendationWarning: response.data.warning || null,
        });
        setSaved(true);
      } catch {}
    } catch (err) {
      setError(err.response?.data?.error || "Failed to get crop recommendation");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ N: 50, P: 40, K: 35, temperature: 25, humidity: 70, ph: 6.8, rainfall: 180 });
    setResult(null);
    setError(null);
    setSaved(false);
  };

  return (
    <div className="cpa-tab-content">
      <div className="cpa-form-card">
        <h3>Enter Soil & Climate Parameters</h3>
        <form onSubmit={handleSubmit}>
          {[
            { key: "N", label: "NITROGEN (N) PPM", type: "number", step: "0.1", min: "0", max: "200" },
            { key: "P", label: "PHOSPHORUS (P) PPM", type: "number", step: "0.1", min: "0", max: "150" },
            { key: "K", label: "POTASSIUM (K) PPM", type: "number", step: "0.1", min: "0", max: "100" },
            { key: "temperature", label: "TEMPERATURE (°C)", type: "number", step: "0.1", min: "-50", max: "50" },
            { key: "humidity", label: "HUMIDITY (%)", type: "number", step: "0.1", min: "0", max: "100" },
            { key: "rainfall", label: "RAINFALL (MM)", type: "number", step: "0.1", min: "0", max: "500" },
            { key: "ph", label: "SOIL PH", type: "number", step: "0.1", min: "3", max: "10" },
          ].map(({ key, label, type, step, min, max }) => (
            <div className="cpa-field" key={key}>
              <label>{label}:</label>
              <input name={key} value={formData[key]} onChange={handleInputChange} type={type} step={step} min={min} max={max} required />
            </div>
          ))}
          <div className="cpa-btn-row">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Analyzing..." : "Get Recommendation"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>Reset</button>
          </div>
        </form>
      </div>

      {error && <div className="cpa-result-card"><p className="cpa-error">Error: {error}</p></div>}
      {result && (
        <div className="cpa-result-card">
          {saved && <div className="cpa-saved-badge">✓ Saved to Records</div>}
          {result.warning && (
            <div className="cpa-warning">
              <span className="cpa-warning-icon">⚠️</span>
              <div>
                <strong>Unreliable recommendation:</strong> {result.warning.message}
              </div>
            </div>
          )}
          <h3>Recommendation Result</h3>
          <div className="cpa-crop-result">
            <span className="cpa-crop-name">{result.recommendation.predicted_crop}</span>
            <span className="cpa-crop-conf">
              {result.warning
                ? "⚠ unreliable — temperature outside model range"
                : `${result.recommendation.confidence}% confidence`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Combined Page ── */
export default function CropPestAnalysis() {
  const [activeTab, setActiveTab] = useState("pest");

  return (
    <div className="cpa-page">
      <div className="cpa-header">
        <h1>Crop & Pest Analysis</h1>
        <p>AI-powered pest risk prediction and crop recommendations</p>
      </div>

      <div className="cpa-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`cpa-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="cpa-tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "pest" ? <PestTab /> : <CropTab />}
    </div>
  );
}
