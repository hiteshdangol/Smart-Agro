
import React, { useState } from 'react';
import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';
import '../styles/CropRecommendation.css';

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
  const [saved, setSaved] = useState(false);

  const sanitizeNumber = (value) => value.replace(/^(-)?0+(?=\d)/, '$1');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: sanitizeNumber(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = Object.fromEntries(
        Object.entries(formData).map(([key, val]) => [key, parseFloat(val)])
      );
      const response = await axios.post('http://localhost:5000/api/crop-recommendation/recommend', payload);
      setResult(response.data);
      try {
        await axiosInstance.post('/records', {
          type: 'recommendation',
          soilParams: { N: parseFloat(formData.N), P: parseFloat(formData.P), K: parseFloat(formData.K), ph: parseFloat(formData.ph) },
          climateParams: { temperature: parseFloat(formData.temperature), humidity: parseFloat(formData.humidity), rainfall: parseFloat(formData.rainfall) },
          recommendedCrop: response.data.recommendation.predicted_crop,
          recommendationConfidence: response.data.recommendation.confidence,
          recommendationWarning: response.data.warning || null,
        });
        setSaved(true);
      } catch {}
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
      setSaved(false);
  };

  return (
     <>
    <div className="crop-recommendation-container">
      <div className="header">
        <h1 className="main-title">Crop Recommendation</h1>
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
                  max="200"
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
                  max="150"
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
                  max="100"
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
                min="3"
                max="10"
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
                  min="-50"
                  max="50"
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
                  max="500"
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
            <div className="recommendation-result-card">
              {saved && <div className="disease-saved-badge">✓ Saved to Records</div>}
              <h3>Recommendation Result</h3>
              {result.warning && (
                <div className="crop-warning-banner">
                  <span className="crop-warning-icon">⚠️</span>
                  <div>
                    <strong>Unreliable recommendation:</strong> {result.warning.message}
                  </div>
                </div>
              )}
              <p><strong>Recommended Crop:</strong> {result.recommendation.predicted_crop}</p>
              <p>
                <strong>Confidence:</strong>{' '}
                {result.warning
                  ? <span className="crop-unreliable-label">unreliable — temperature outside model range</span>
                  : `${result.recommendation.confidence}%`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default CropRecommendation;
