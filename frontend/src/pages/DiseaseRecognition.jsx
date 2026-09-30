import React, { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance";
import "../styles/DiseaseRecognition.css";

export default function DiseaseRecognition() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [addedItems, setAddedItems] = useState({});
  const [savedRecord, setSavedRecord] = useState(null);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [wishlistKeys, setWishlistKeys] = useState({});
  const inputRef = useRef(null);
  const recordIdRef = useRef(null);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const res = await axiosInstance.get("/wishlist/mine");
        const keys = {};
        (res.data.wishlist || []).forEach((item) => {
          keys[`${item.diseaseName}::${item.medicineName.toLowerCase()}`] = true;
        });
        setWishlistKeys(keys);
      } catch {
      }
    };
    loadWishlist();
  }, []);

  const wishlistKey = (diseaseName, medicineName) =>
    `${diseaseName}::${medicineName.toLowerCase()}`;

  const handleWishlist = async (med) => {
    try {
      const key = wishlistKey(result.name, med.productName);
      await axiosInstance.post("/wishlist", {
        medicineName: med.productName,
        diseaseName: result.name,
        type: med.type,
      });
      setWishlistKeys((prev) => ({ ...prev, [key]: true }));
    } catch {
    }
  };

  useEffect(() => {
    return () => {
      if (savedRecord?._id || recordIdRef.current) {
      }
    };
  }, [savedRecord]);

  const fileToBase64 = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const saveDiseaseRecord = async (data, base64) => {
    try {
      const payload = {
        type: "disease",
        diseaseName: data.name,
        diseaseCause: data.cause,
        diseaseCure: data.cure,
        confidence: data.confidence,
        top3: data.top3 || [],
        imageBase64: base64,
        medicines: data.medicines || [],
        purchasedProducts: [],
      };
      const res = await axiosInstance.post("/records", payload);
      recordIdRef.current = res.data.record._id;
      setSavedRecord(res.data.record);
    } catch {
    }
  };

  const addPurchase = async (product) => {
    if (!recordIdRef.current) return;
    try {
      const res = await axiosInstance.post(`/records/${recordIdRef.current}/purchase`, {
        product: {
          productId: product._id,
          productName: product.name,
          price: product.price,
          quantity: 1,
        },
      });
      setSavedRecord(res.data.record);
      setPurchasedProducts((prev) => {
        if (prev.find((p) => p.productId === product._id)) return prev;
        return [...prev, { productId: product._id, productName: product.name, price: product.price, quantity: 1 }];
      });
    } catch {
    }
  };

  const addToCart = useCallback((product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      existing.quantity = Math.min((existing.quantity || 1) + 1, product.stock);
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
    setAddedItems((prev) => ({ ...prev, [product._id]: true }));
    addPurchase(product);
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product._id]: false }));
    }, 2000);
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/jpg"].includes(f.type)) {
      setError("Only JPG, JPEG, and PNG files are allowed");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB");
      return;
    }
    setError(null);
    setResult(null);
    setSavedRecord(null);
    setPurchasedProducts([]);
    recordIdRef.current = null;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleChange = (e) => handleFile(e.target.files[0]);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSavedRecord(null);
    setPurchasedProducts([]);
    recordIdRef.current = null;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/disease/predict",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(data);
      if (data.recognized) {
        const base64 = await fileToBase64(file);
        await saveDiseaseRecord(data, base64);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze image. Is the service running?");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setSavedRecord(null);
    setPurchasedProducts([]);
    recordIdRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
  };

  const getConfidenceClass = (conf) => {
    if (conf >= 80) return "confidence-high";
    if (conf >= 60) return "confidence-mid";
    return "confidence-low";
  };

  const parseName = (name) => {
    return name.replace(/_/g, " ").replace(/\//g, " / ");
  };

  const getConfidenceBar = (conf) => {
    return { width: `${Math.min(conf, 100)}%` };
  };

  return (
    <div className="disease-page">
      <div className="disease-header">
        <h1>Plant Disease Recognition</h1>
        <p>Upload a leaf photo to identify plant diseases and get treatment recommendations</p>
      </div>

      <div className="disease-content">
        <div className="disease-upload-section">
          <div
            className={`disease-dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !file && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleChange}
              hidden
            />
            {preview ? (
              <div className="disease-preview">
                <img src={preview} alt="Leaf preview" />
                <button
                  className="disease-remove-btn"
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                >
                  &times;
                </button>
              </div>
            ) : (
              <div className="disease-dropzone-text">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p>Drag & drop a leaf image here, or click to browse</p>
                <span className="disease-hint">Supports JPG, JPEG, PNG (max 10MB)</span>
              </div>
            )}
          </div>

          <button
            className="btn btn-primary disease-analyze-btn"
            onClick={handleSubmit}
            disabled={!file || loading}
          >
            {loading ? (
              <span className="disease-spinner"></span>
            ) : (
              "Analyze Leaf"
            )}
          </button>
        </div>

        <div className="disease-results-section">
          {error && (
            <div className="disease-result-card disease-error">
              <h3>Error</h3>
              <p>{error}</p>
              <button className="btn btn-secondary" onClick={reset}>Try Again</button>
            </div>
          )}

          {loading && (
            <div className="disease-result-card disease-loading">
              <div className="disease-loading-animation">
                <div className="disease-loading-leaf">🌿</div>
              </div>
              <h3>Analyzing your leaf...</h3>
              <p>Running AI model prediction</p>
            </div>
          )}

          {result && !loading && (
            <div className="disease-result-card">
              {result.recognized ? (
                <>
                  <div className="disease-result-badge">
                    {result.name.includes("healthy") ? "✅ Healthy" : "⚠️ Disease Detected"}
                  </div>
                  <h2 className={result.name.includes("healthy") ? "disease-name-healthy" : "disease-name"}>
                    {parseName(result.name)}
                  </h2>
                  <div className={`disease-confidence ${getConfidenceClass(result.confidence)}`}>
                    <div className="disease-confidence-label">
                      <span>Confidence</span>
                      <span>{result.confidence}%</span>
                    </div>
                    <div className="disease-confidence-bar">
                      <div className={`disease-confidence-fill ${getConfidenceClass(result.confidence)}`} style={getConfidenceBar(result.confidence)}></div>
                    </div>
                  </div>
                  {savedRecord && (
                    <div className="disease-saved-badge">✓ Saved to Records</div>
                  )}
                  {!result.name.includes("healthy") && (
                    <>
                      <div className="disease-info-block">
                        <h4>Cause</h4>
                        <p>{result.cause}</p>
                      </div>
                      <div className="disease-info-block">
                        <h4>Treatment / Cure</h4>
                        <p>{result.cure}</p>
                      </div>
                      {result.medicines && result.medicines.length > 0 && (
                        <div className="disease-medicines-section">
                          <h4>Recommended Medicines</h4>
                          {result.medicines.map((med, idx) => {
                            const medNames = [med.productName, ...(med.suggestedProductNames || [])]
                              .filter(Boolean)
                              .map(n => n.toLowerCase());
                            const linkedProduct = result.shopProducts?.find(
                              p => medNames.includes(p.name.toLowerCase())
                            );
                            const available = linkedProduct && linkedProduct.stock > 0;
                            const wished = wishlistKeys[wishlistKey(result.name, med.productName)];
                            return (
                              <div key={idx} className={`disease-medicine-card ${med.type}`}>
                                <div className="disease-medicine-header">
                                  <span className={`disease-medicine-type ${med.type}`}>
                                    {med.type === 'chemical' ? '🧪 Chemical' : '🌱 Organic'}
                                  </span>
                                  <strong>{med.productName}</strong>
                                </div>
                                <p className="disease-medicine-desc">{med.description}</p>
                                {med.applicationInstructions && (
                                  <p className="disease-medicine-usage">
                                    <span className="disease-medicine-usage-label">How to use:</span>
                                    {med.applicationInstructions}
                                  </p>
                                )}
                                {available ? (
                                  <button
                                    className={`disease-buy-btn ${addedItems[linkedProduct._id] ? 'added' : ''}`}
                                    onClick={() => addToCart(linkedProduct)}
                                    disabled={addedItems[linkedProduct._id]}
                                  >
                                    {addedItems[linkedProduct._id] ? 'Added ✓' : 'Buy Now'}
                                  </button>
                                ) : (
                                  <>
                                    <p className="disease-medicine-unavailable">Not available in shop</p>
                                    <button
                                      className={`disease-wish-btn ${wished ? 'added' : ''}`}
                                      onClick={() => handleWishlist(med)}
                                      disabled={wished}
                                    >
                                      {wished ? 'Wishlisted ✓' : 'Wishlist'}
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                  {result.recognized && result.top3 && (
                    <details className="disease-top3">
                      <summary>View top predictions</summary>
                      <div className="disease-top3-list">
                        {result.top3.map((item, i) => (
                          <div key={i} className="disease-top3-item">
                            <span className="disease-top3-rank">#{i + 1}</span>
                            <span className="disease-top3-label">{parseName(item.label)}</span>
                            <span className="disease-top3-prob">{item.probability}%</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </>
              ) : (
                <>
                  <div className="disease-result-badge disease-unrecognized">❓ Unrecognized</div>
                  <p className="disease-unrecognized-text">{result.cause}</p>
                  <p className="disease-unrecognized-text">{result.cure}</p>
                  {result.top3 && (
                    <details className="disease-top3">
                      <summary>Low-confidence predictions</summary>
                      <div className="disease-top3-list">
                        {result.top3.map((item, i) => (
                          <div key={i} className="disease-top3-item">
                            <span className="disease-top3-rank">#{i + 1}</span>
                            <span className="disease-top3-label">{parseName(item.label)}</span>
                            <span className="disease-top3-prob">{item.probability}%</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </>
              )}
              <button className="btn btn-primary disease-analyze-another" onClick={reset}>
                Analyze Another Leaf
              </button>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="disease-result-card disease-placeholder">
              <div className="disease-placeholder-icon">🌿</div>
              <h3>Upload a leaf image</h3>
              <p>The AI will identify the plant species and any diseases present, then recommend treatments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
