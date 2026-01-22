
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/CropRecommendation.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    N: 78,
    P: 42,
    K: 45,
    temperature: 26,
    humidity: 81,
    ph: 6.5,
    rainfall: 242
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/crop-recommendation/recommend', formData);
      console.log("response: ",response)
      setResult(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Failed to get crop recommendation');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      N: 50, P: 40, K: 35, temperature: 25, humidity: 70, ph: 6.8, rainfall: 180
    });
    setResult(null);
    setError(null);
  };

  return (
     <>
          <Navbar />
    <div className="crop-recommendation-container">
      <div className="header">
        <h1 className="main-title">🌱 Smart Crop Recommendation System</h1>
        <p className="subtitle">AI-powered crop suggestions based on soil and climate conditions</p>
      </div>

      <div className="form-container">
        <div className="form-section">
          <h2 className="section-title">Environmental Parameters</h2>
          
          <form onSubmit={handleSubmit} className="parameter-form">
            {/* Soil Parameters */}
            <div className="input-group">
              <div className="input-field">
                <label className="input-label">Nitrogen (N) - ppm</label>
                <input
                  type="number"
                  name="N"
                  value={formData.N}
                  onChange={handleInputChange}
                  className="input-control"
                  step="0.1"
                  min="0"
                  required
                />
                <span className="input-hint">Ideal: 20-80</span>
              </div>

              <div className="input-field">
                <label className="input-label">Phosphorus (P) - ppm</label>
                <input
                  type="number"
                  name="P"
                  value={formData.P}
                  onChange={handleInputChange}
                  className="input-control"
                  step="0.1"
                  min="0"
                  required
                />
                <span className="input-hint">Ideal: 30-70</span>
              </div>

              <div className="input-field">
                <label className="input-label">Potassium (K) - ppm</label>
                <input
                  type="number"
                  name="K"
                  value={formData.K}
                  onChange={handleInputChange}
                  className="input-control"
                  step="0.1"
                  min="0"
                  required
                />
                <span className="input-hint">Ideal: 30-60</span>
              </div>
            </div>

            <div className="input-field">
              <label className="input-label">Soil pH</label>
              <input
                type="number"
                name="ph"
                value={formData.ph}
                onChange={handleInputChange}
                className="input-control"
                step="0.1"
                min="0"
                max="14"
                required
              />
              <span className="input-hint">Ideal: 6.0-7.5</span>
            </div>

            {/* Climate Parameters */}
            <div className="input-group">
              <div className="input-field">
                <label className="input-label">Temperature (°C)</label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  className="input-control"
                  step="0.1"
                  required
                />
              </div>

              <div className="input-field">
                <label className="input-label">Humidity (%)</label>
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleInputChange}
                  className="input-control"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="input-field">
                <label className="input-label">Rainfall (mm)</label>
                <input
                  type="number"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleInputChange}
                  className="input-control"
                  step="0.1"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="button-group">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? '🔄 Analyzing...' : '🌾 Get Recommendation'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
              >
                Reset
              </button>
            </div>
          </form>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {result && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h3>Recommendation Result:</h3>
              <p><strong>Recommended Crop:</strong> {result.recommendation.predicted_crop}</p>
              <p><strong>Confidence:</strong> {result.recommendation.confidence}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default CropRecommendation;
