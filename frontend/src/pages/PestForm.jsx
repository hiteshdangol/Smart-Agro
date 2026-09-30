import React, { useState } from "react";
import axios from "axios";
import "../styles/PestForm.css";

export default function PestForm() {
  const [form, setForm] = useState({
    temp_avg: 26,
    humidity: 81,
    rainfall_mm: 242,
    crop_type: "Tomato",
    growth_stage: "Vegetative",
    prev_pest_incidence: 0.1
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      console.error(err);
      setError(err.response?.data?.error || "Failed to get prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="pest-form-page">
        <h1>Pest Risk Prediction</h1>
        <p>Analyze pest risk for your crops</p>
        <div className="pest-form-card">
          <h2>Enter Crop Parameters</h2>
          <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
            {Object.keys(form).map(key => (
              <div key={key}>
                <label>{key.replace('_', ' ').toUpperCase()}:</label>
                {key === 'crop_type' ? (
                  <select name={key} value={form[key]} onChange={handleChange}>
                    <option value="Tomato">Tomato</option>
                    <option value="Maize">Maize</option>
                    <option value="Potato">Potato</option>
                  </select>
                ) : key === 'growth_stage' ? (
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
                    min={key === 'temp_avg' ? '-50' : '0'}
                    max={key === 'temp_avg' ? '50' : key === 'humidity' ? '100' : key === 'rainfall_mm' ? '500' : key === 'prev_pest_incidence' ? '1' : undefined}
                    required
                  />
                )}
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Predicting...' : 'Predict Risk'}
            </button>
          </form>
        </div>

        {error && (
          <div className="pest-result-card">
            <p style={{ color: '#e74c3c' }}>Error: {error}</p>
          </div>
        )}

        {result && (
          <div className="pest-result-card">
            <h2>Prediction Result</h2>
            <h3>{result.risk_level}</h3>
            <p>Risk assessment for your crops</p>
          </div>
        )}
      </div>
    </>
  );
}
