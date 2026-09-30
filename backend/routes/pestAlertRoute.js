const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/pest-risk", async (req, res) => {
  try {
    const payload = req.body; // 6-feature JSON
    const { data } = await axios.post("http://127.0.0.1:5002/predict", payload);
    res.json(data);
  } catch (err) {
    // Python service down
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: "Pest risk service unavailable. Please ensure the Python service is running on port 5002.",
        service_status: "offline"
      });
    }

    // Pydantic validation failure (422) - surface the human-readable detail
    if (err.response?.status === 422) {
      const detail = err.response.data?.detail;
      const messages = Array.isArray(detail)
        ? detail.map(d => d.msg).join(", ")
        : (detail || "Invalid input values");
      return res.status(400).json({
        success: false,
        error: `Invalid input: ${messages}`
      });
    }

    const message =
      (typeof err.response?.data === 'string' ? err.response.data : err.response?.data?.detail) ||
      err.response?.data ||
      err.message;

    res.status(err.response?.status || 500).json({
      success: false,
      error: message
    });
  }
});

module.exports = router;

