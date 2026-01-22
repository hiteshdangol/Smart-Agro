const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/pest-risk", async (req, res) => {
  try {
    const payload = req.body; // 6-feature JSON
    const { data } = await axios.post("http://127.0.0.1:5002/predict", payload);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;

