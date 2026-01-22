const express = require("express");
const axios = require("axios");
const router = express.Router();

// Route for crop recommendation using KNN
router.post("/recommend", async (req, res) => {
  try {
    console.log("Received crop recommendation request:", req.body);

    // Validate required fields
    const requiredFields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];
    const missingFields = requiredFields.filter(field => req.body[field] === undefined);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        required_fields: requiredFields
      });
    }

    // Prepare payload for Python KNN service
    const payload = {
      N: parseFloat(req.body.N),
      P: parseFloat(req.body.P), 
      K: parseFloat(req.body.K),
      temperature: parseFloat(req.body.temperature),
      humidity: parseFloat(req.body.humidity),
      ph: parseFloat(req.body.ph),
      rainfall: parseFloat(req.body.rainfall)
    };

    console.log("Sending to KNN service:", payload);

    // Call Python KNN service
    const { data } = await axios.post("http://127.0.0.1:5003/predict", payload);
    
    // Enhance response with additional information
    const enhancedResponse = {
      success: true,
      recommendation: data.prediction,
      analysis: {
        soil_analysis: analyzeSoilConditions(payload),
        climate_analysis: analyzeClimateConditions(payload),
        recommendations: generateFarmingTips(data.prediction.recommended_crop, payload)
      },
      timestamp: new Date().toISOString()
    };

    res.json(enhancedResponse);

  } catch (err) {
    console.error("Error in crop recommendation:", err.message);
    
    // Handle specific Python service errors
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: "KNN service unavailable. Please ensure Python service is running on port 5002.",
        service_status: "offline"
      });
    }

    res.status(500).json({ 
      success: false,
      error: err.response?.data?.error || err.message,
      message: "Failed to generate crop recommendation"
    });
  }
});

// Route to get soil analysis only
router.post("/soil-analysis", (req, res) => {
  try {
    const { N, P, K, ph } = req.body;
    
    if (!N || !P || !K || !ph) {
      return res.status(400).json({
        error: "Missing soil parameters: N, P, K, ph required"
      });
    }

    const analysis = analyzeSoilConditions({ N, P, K, ph });
    res.json({
      success: true,
      soil_analysis: analysis
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Route to retrain KNN model
router.post("/retrain", async (req, res) => {
  try {
    const { k } = req.body;
    const payload = k ? { k: parseInt(k) } : {};

    const { data } = await axios.post("http://127.0.0.1:5002/retrain", payload);
    
    res.json({
      success: true,
      message: "KNN model retrained successfully",
      details: data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.response?.data?.error || err.message,
      message: "Failed to retrain model"
    });
  }
});

// Route to check KNN service health
router.get("/health", async (req, res) => {
  try {
    const { data } = await axios.get("http://127.0.0.1:5002/health");
    
    res.json({
      success: true,
      knn_service: data,
      backend_status: "healthy"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      knn_service: "offline",
      backend_status: "healthy",
      error: err.message
    });
  }
});

// Helper function to analyze soil conditions
function analyzeSoilConditions({ N, P, K, ph }) {
  const analysis = {
    nutrient_levels: {},
    ph_analysis: {},
    recommendations: []
  };

  // Analyze NPK levels
  analysis.nutrient_levels = {
    nitrogen: {
      value: N,
      status: N < 20 ? 'low' : N > 80 ? 'high' : 'optimal',
      ideal_range: '20-80 ppm'
    },
    phosphorus: {
      value: P,
      status: P < 30 ? 'low' : P > 70 ? 'high' : 'optimal',
      ideal_range: '30-70 ppm'
    },
    potassium: {
      value: K,
      status: K < 30 ? 'low' : K > 60 ? 'high' : 'optimal',
      ideal_range: '30-60 ppm'
    }
  };

  // Analyze pH
  analysis.ph_analysis = {
    value: ph,
    status: ph < 6.0 ? 'acidic' : ph > 7.5 ? 'alkaline' : 'neutral',
    ideal_range: '6.0-7.5',
    description: ph < 6.0 ? 'Soil is too acidic' : ph > 7.5 ? 'Soil is too alkaline' : 'Good pH level'
  };

  // Generate recommendations
  if (analysis.nutrient_levels.nitrogen.status === 'low') {
    analysis.recommendations.push('Apply nitrogen-rich fertilizers or organic compost');
  }
  if (analysis.nutrient_levels.phosphorus.status === 'low') {
    analysis.recommendations.push('Add phosphorus fertilizers or bone meal');
  }
  if (analysis.nutrient_levels.potassium.status === 'low') {
    analysis.recommendations.push('Apply potash or wood ash for potassium');
  }
  if (ph < 6.0) {
    analysis.recommendations.push('Add lime to reduce soil acidity');
  }
  if (ph > 7.5) {
    analysis.recommendations.push('Add sulfur or organic matter to reduce alkalinity');
  }

  return analysis;
}

// Helper function to analyze climate conditions
function analyzeClimateConditions({ temperature, humidity, rainfall }) {
  return {
    temperature: {
      value: temperature,
      status: temperature < 15 ? 'cool' : temperature > 35 ? 'hot' : 'moderate',
      suitability: temperature >= 15 && temperature <= 35 ? 'good' : 'challenging'
    },
    humidity: {
      value: humidity,
      status: humidity < 40 ? 'dry' : humidity > 80 ? 'humid' : 'moderate',
      suitability: humidity >= 40 && humidity <= 80 ? 'good' : 'needs attention'
    },
    rainfall: {
      value: rainfall,
      status: rainfall < 100 ? 'low' : rainfall > 300 ? 'high' : 'adequate',
      suitability: rainfall >= 100 && rainfall <= 300 ? 'good' : 'requires management'
    }
  };
}

// Helper function to generate farming tips
function generateFarmingTips(crop, conditions) {
  const cropTips = {
    'rice': [
      'Ensure proper water management - rice needs consistent water supply',
      'Monitor for pests like brown planthopper',
      'Maintain field temperature between 20-35°C',
      'Apply nitrogen fertilizer in split doses'
    ],
    'wheat': [
      'Plant during cool season (15-25°C optimal)',
      'Ensure good drainage to prevent waterlogging',
      'Apply phosphorus at sowing time',
      'Monitor for rust diseases in humid conditions'
    ],
    'maize': [
      'Provide adequate spacing for good air circulation',
      'Apply balanced NPK fertilization',
      'Ensure consistent moisture during tasseling',
      'Watch for corn borer and fall armyworm'
    ],
    'chickpea': [
      'Plant in well-drained soil',
      'Avoid waterlogged conditions',
      'Apply phosphorus and potassium before sowing',
      'Monitor for pod borer during flowering'
    ]
  };

  const general = [
    'Test soil regularly for nutrient levels',
    'Practice crop rotation to maintain soil health',
    'Use integrated pest management strategies',
    'Monitor weather conditions regularly'
  ];

  return {
    crop_specific: cropTips[crop] || ['Follow standard practices for this crop'],
    general: general,
    climate_considerations: getClimateRecommendations(conditions)
  };
}

// Helper function for climate-specific recommendations
function getClimateRecommendations({ temperature, humidity, rainfall }) {
  const recommendations = [];

  if (temperature > 30) {
    recommendations.push('Provide shade or mulching to protect plants from heat stress');
  }
  if (humidity > 80) {
    recommendations.push('Ensure good air circulation to prevent fungal diseases');
  }
  if (rainfall < 100) {
    recommendations.push('Set up irrigation system for adequate water supply');
  }
  if (rainfall > 250) {
    recommendations.push('Ensure proper drainage to prevent waterlogging');
  }

  return recommendations;
}

module.exports = router;