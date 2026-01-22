import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Dashboard.css";
import axiosInstance from "../utils/axiosInstance";
import SensorGraph from "../components/SensorGraphs";

function Dashboard() {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    lightIntensity: 0,
  });
  const [cropData, setCropData] = useState({
    crop: "",
    cultivationDate: "",
    quantity: "",
    description: "",
  });
  const [suggestedCrops, setSuggestedCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSensorData = async () => {
    try {
      const response = await axiosInstance.get("/sensor-data");
      setSensorData(response.data);
      suggestCrops();
    } catch (error) {
      console.error("Error fetching sensor data:", error);
    }
  };

  const suggestCrops = () => {
  const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
  const crops = [];

  switch (month) {
    case 0: // January
      crops.push({
        name: "Wheat",
        reason: "Cool weather and moderate soil moisture are ideal for wheat."
      });
      break;

    case 1: // February
      crops.push({
        name: "Barley",
        reason: "Barley thrives in late winter with cool temperatures."
      });
      break;

    case 2: // March
      crops.push({
        name: "Maize",
        reason: "Warm spring weather is suitable for maize germination."
      });
      break;

    case 3: // April
      crops.push({
        name: "Rice (early variety)",
        reason: "Rising temperatures and water availability help rice seedlings."
      });
      break;

    case 4: // May
      crops.push({
        name: "Sugarcane",
        reason: "Hot weather and long days support sugarcane growth."
      });
      break;

    case 5: // June
      crops.push({
        name: "Paddy",
        reason: "Monsoon rains provide water needed for paddy cultivation."
      });
      break;

    case 6: // July
      crops.push({
        name: "Cotton",
        reason: "Cotton thrives in humid conditions with good rainfall."
      });
      break;

    case 7: // August
      crops.push({
        name: "Soybean",
        reason: "Warm, moist climate in August suits soybean cultivation."
      });
      break;

    case 8: // September
      crops.push({
        name: "Millets",
        reason: "Dry conditions after monsoon are suitable for millet."
      });
      break;

    case 9: // October
      crops.push({
        name: "Mustard",
        reason: "Cooler temperatures after monsoon support mustard crops."
      });
      break;

    case 10: // November
      crops.push({
        name: "Chickpeas",
        reason: "Winter onset provides the best conditions for pulses like chickpeas."
      });
      break;

    case 11: // December
      crops.push({
        name: "Wheat",
        reason: "Cold weather is favorable for wheat germination and growth."
      });
      break;

    default:
      crops.push({
        name: "General Crops",
        reason: "No specific recommendation."
      });
  }

  setSuggestedCrops(crops);
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axiosInstance.post("/records", cropData);
      alert("Crop record added successfully!");
      setCropData({
        crop: "",
        cultivationDate: "",
        quantity: "",
        description: "",
      });
    } catch (error) {
      console.error("Error adding crop record:", error);
      alert("Failed to add crop record. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1>🌱 Smart Famring</h1>
        <div className="dashboard-sections">
          <section className="graphs-section">
            <h2>📊 Sensor Graphs</h2>
            <div className="graphs-grid">
              <div className="graph-container">
                <SensorGraph sensorType="Air Humidity" />
              </div>
              <div className="graph-container">
                <SensorGraph sensorType="Soil Moisture" />
              </div>
              <div className="graph-container">
                <SensorGraph sensorType="Light Intensity" />
              </div>
            </div>
          </section>

          <section className="suggestions-section">
            <h2>🌾 Crop Suggestions</h2>
            <div className="crop-card-grid">
              {suggestedCrops.length > 0 ? (
                suggestedCrops.map((crop, index) => (
                  <div key={index} className="crop-card">
                    <h3>{crop.name}</h3>
                    <p>{crop.reason}</p>
                  </div>
                ))
              ) : (
                <p>No crop suggestions available at the moment.</p>
              )}
            </div>
          </section>

          <section className="form-section">
            <h2>📝 Submit Crop Data</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="crop"
                placeholder="Crop Name"
                value={cropData.crop}
                onChange={(e) =>
                  setCropData({ ...cropData, crop: e.target.value })
                }
                required
              />
              <input
                type="date"
                name="cultivationDate"
                value={cropData.cultivationDate}
                onChange={(e) =>
                  setCropData({ ...cropData, cultivationDate: e.target.value })
                }
                required
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity (kg)"
                value={cropData.quantity}
                onChange={(e) =>
                  setCropData({ ...cropData, quantity: e.target.value })
                }
                required
              />
              <textarea
                name="description"
                placeholder="Additional Notes"
                value={cropData.description}
                onChange={(e) =>
                  setCropData({ ...cropData, description: e.target.value })
                }
                required
              ></textarea>
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}



export default Dashboard;
