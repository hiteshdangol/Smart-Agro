

import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
export default function PestForm() {
  const [form, setForm] = useState({
    temp_avg: 26,
    humidity: 81,
    rainfall_mm: 242,
    crop_type: "rice",
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
    
    try {
      // Fixed: Use correct backend URL and endpoint
      const { data } = await axios.post("http://localhost:5000/api/pest-alert/pest-risk", form);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to get prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
      <>
          <Navbar />
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Pest Risk Prediction</h2>
      
      {Object.keys(form).map(key => (
        <div key={key} style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            {key.replace('_', ' ').toUpperCase()}:
          </label>
          {key === 'crop_type' ? (
            <select 
              name={key} 
              value={form[key]} 
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="Tomato">Tomato</option>
              <option value="Rice">Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Corn">Corn</option>
            </select>
          ) : key === 'growth_stage' ? (
            <select 
              name={key} 
              value={form[key]} 
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            >
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
              style={{ width: '100%', padding: '8px' }}
            />
          )}
        </div>
      ))}
      
      <button 
        onClick={submit}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Predicting...' : 'Predict Risk'}
      </button>
      
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error: {error}
        </div>
      )}
      
      {result && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h3>Prediction Result:</h3>
    <p>Risk Level: <strong>{result.risk_level}</strong></p>
        </div>
      )}
    </div>
    <Footer />
    </>
  );
}