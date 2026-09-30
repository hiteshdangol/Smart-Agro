import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import '../styles/PreviousRecords.css';

const TABS = [
  { key: 'crop', label: 'Crops', icon: '🌾' },
  { key: 'disease', label: 'Diseases', icon: '🔬' },
  { key: 'recommendation', label: 'Recommendations', icon: '🌱' },
];

function PreviousRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('crop');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/records');
      setRecords(response.data.records || []);
    } catch {
      setError('Error fetching records.');
    } finally {
      setLoading(false);
    }
  };

  const cropRecords = records.filter((r) => r.type === 'crop');
  const diseaseRecords = records.filter((r) => r.type === 'disease');
  const recommendationRecords = records.filter((r) => r.type === 'recommendation');

  const groupedCrops = cropRecords.reduce((acc, r) => {
    if (!acc[r.crop]) acc[r.crop] = [];
    acc[r.crop].push(r);
    return acc;
  }, {});

  const getConfidenceClass = (conf) => {
    if (conf >= 80) return 'conf-high';
    if (conf >= 60) return 'conf-mid';
    return 'conf-low';
  };

  const getRecommendationWarning = (record) => {
    if (record.recommendationWarning && record.recommendationWarning.message) {
      return record.recommendationWarning;
    }
    const temp = record.climateParams?.temperature;
    if (temp != null && (temp < -20 || temp > 43)) {
      return {
        temperature_out_of_range: true,
        training_range: '-20 - 43 °C',
        message: `Temperature (${temp}°C) is outside the model's training range (-20 - 43 °C). The recommendation may be unreliable.`,
      };
    }
    return null;
  };

  return (
    <div className="records-page">
      <h1>Previous Records</h1>

      <div className="records-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`records-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="records-tab-icon">{tab.icon}</span>
            <span className="records-tab-label">{tab.label}</span>
            <span className="records-tab-count">
              {tab.key === 'crop' ? cropRecords.length : tab.key === 'disease' ? diseaseRecords.length : recommendationRecords.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><p>Loading records...</p></div>
      ) : error ? (
        <div className="error-message"><p>{error}</p></div>
      ) : (
        <>
          {/* ── Crops Tab ── */}
          {activeTab === 'crop' && (
            <>
              {Object.keys(groupedCrops).length > 0 ? (
                Object.keys(groupedCrops).map((crop) => (
                  <div className="category-section" key={crop}>
                    <h2 className="category-title">{crop}</h2>
                    <div className="records-container">
                      {groupedCrops[crop].map((record) => (
                        <div className="record-box" key={record._id}>
                          <p><strong>Cultivation Date:</strong> {new Date(record.cultivationDate).toLocaleDateString()}</p>
                          <p><strong>Quantity:</strong> {record.quantity} kg</p>
                          <p><strong>Description:</strong> {record.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-records">No crop records found.</p>
              )}
            </>
          )}

          {/* ── Diseases Tab ── */}
          {activeTab === 'disease' && (
            <>
              {diseaseRecords.length > 0 ? (
                <div className="disease-records-container">
                  {diseaseRecords.map((record) => (
                    <div className="disease-record-card" key={record._id}>
                      <div className="disease-record-top">
                        {record.imageBase64 && (
                          <div className="disease-record-thumb">
                            <img src={record.imageBase64} alt="Leaf" />
                          </div>
                        )}
                        <div className="disease-record-info">
                          <div className="disease-record-name">
                            <span className="disease-record-badge">⚠️ Disease</span>
                            <strong>{record.diseaseName?.replace(/_/g, ' ')}</strong>
                          </div>
                          {record.confidence != null && (
                            <div className="disease-record-confidence">
                              <div className={`disease-record-conf-bar ${getConfidenceClass(record.confidence)}`}>
                                <div className="disease-record-conf-fill" style={{ width: `${Math.min(record.confidence, 100)}%` }}></div>
                              </div>
                              <span className="disease-record-conf-text">{record.confidence}%</span>
                            </div>
                          )}
                          <div className="disease-record-date">
                            {new Date(record.createdAt).toLocaleDateString()} {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      {(record.diseaseCause || record.diseaseCure) && (
                        <div className="disease-record-details">
                          {record.diseaseCause && (
                            <div className="disease-record-detail">
                              <span className="rec-label">Cause:</span>
                              <p>{record.diseaseCause}</p>
                            </div>
                          )}
                          {record.diseaseCure && (
                            <div className="disease-record-detail">
                              <span className="rec-label">Treatment:</span>
                              <p>{record.diseaseCure}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {record.medicines && record.medicines.length > 0 && (
                        <div className="disease-record-medicines">
                          <h4>Medicines</h4>
                          <div className="disease-record-med-list">
                            {record.medicines.map((med, i) => (
                              <span key={i} className={`disease-record-med-tag ${med.type}`}>
                                {med.productName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.purchasedProducts && record.purchasedProducts.length > 0 && (
                        <div className="disease-record-purchases">
                          <h4>Purchased Products</h4>
                          {record.purchasedProducts.map((p, i) => (
                            <div className="disease-record-purchase-item" key={i}>
                              <span className="purchase-name">{p.productName}</span>
                              <span className="purchase-qty">x{p.quantity}</span>
                              <span className="purchase-price">₹{p.price}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-records">No disease records found.</p>
              )}
            </>
          )}

          {/* ── Recommendations Tab ── */}
          {activeTab === 'recommendation' && (
            <>
              {recommendationRecords.length > 0 ? (
                <div className="rec-records-container">
                  {recommendationRecords.map((record) => {
                    const warning = getRecommendationWarning(record);
                    return (
                      <div className="rec-record-card" key={record._id}>
                        <div className="rec-record-header">
                          <span className="rec-record-icon">🌱</span>
                          <div>
                            <div className="rec-record-crop">{record.recommendedCrop}</div>
                            {record.recommendationConfidence != null && (
                              <div className="rec-record-confidence">
                                <div className={`rec-record-conf-bar ${getConfidenceClass(record.recommendationConfidence)}`}>
                                  <div className="rec-record-conf-fill" style={{ width: `${Math.min(record.recommendationConfidence, 100)}%` }}></div>
                                </div>
                                {warning ? (
                                  <span className="rec-record-unreliable">⚠ unreliable</span>
                                ) : (
                                  <span>{record.recommendationConfidence}%</span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="rec-record-date">{new Date(record.createdAt).toLocaleDateString()}</span>
                        </div>

                        {warning && (
                          <div className="rec-record-warning">
                            <span className="rec-record-warning-icon">⚠</span>
                            <span>{warning.message}</span>
                          </div>
                        )}

                        {record.soilParams && (
                          <div className="rec-record-params">
                            <h4>Soil Parameters</h4>
                            <div className="rec-params-grid">
                              <div className="rec-param"><span className="rec-label">N</span><span>{record.soilParams.N} ppm</span></div>
                              <div className="rec-param"><span className="rec-label">P</span><span>{record.soilParams.P} ppm</span></div>
                              <div className="rec-param"><span className="rec-label">K</span><span>{record.soilParams.K} ppm</span></div>
                              <div className="rec-param"><span className="rec-label">pH</span><span>{record.soilParams.ph}</span></div>
                            </div>
                          </div>
                        )}

                        {record.climateParams && (
                          <div className="rec-record-params">
                            <h4>Climate Parameters</h4>
                            <div className="rec-params-grid">
                              <div className="rec-param"><span className="rec-label">Temp</span><span>{record.climateParams.temperature}°C</span></div>
                              <div className="rec-param"><span className="rec-label">Humidity</span><span>{record.climateParams.humidity}%</span></div>
                              <div className="rec-param"><span className="rec-label">Rainfall</span><span>{record.climateParams.rainfall} mm</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-records">No recommendation records found.</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default PreviousRecords;
