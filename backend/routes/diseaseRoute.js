const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Readable } = require("stream");
const axios = require("axios");
const FormData = require("form-data");
const Medicine = require("../models/Medicine");
const Product = require("../models/Product");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "temp_uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|jfif)$/i;
    if (allowed.test(path.extname(file.originalname))) return cb(null, true);
    cb(new Error("Only image files (jpg, jpeg, png, jfif) are allowed"));
  },
});

router.post("/predict", (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No image file provided" });
    }
    try {
      const form = new FormData();
      form.append("file", fs.createReadStream(req.file.path), req.file.filename);
      const { data } = await axios.post("http://127.0.0.1:5004/predict", form, {
        headers: form.getHeaders(),
        timeout: 30000,
      });
      if (data.success && data.recognized && !data.name.includes("healthy")) {
        const medicineDoc = await Medicine.findOne({ diseaseName: data.name });
        const medicines = medicineDoc ? medicineDoc.medicines : [];
        const productNames = medicines.flatMap(m =>
          [m.productName, ...(m.suggestedProductNames || [])].filter(Boolean)
        );
        const shopProducts = productNames.length
          ? await Product.find({
              name: { $regex: new RegExp(productNames.map(escapeRegExp).join('|'), 'i') },
              approvalStatus: 'approved',
            }).populate('seller', 'name')
          : [];
        data.medicines = medicines;
        data.shopProducts = shopProducts;
      }
      res.json(data);
    } catch (err) {
      if (err.code === "ECONNREFUSED") {
        return res.status(503).json({
          success: false,
          error: "Disease recognition service unavailable. Ensure Python service is running on port 5004.",
        });
      }
      res.status(500).json({ success: false, error: err.response?.data?.detail || err.message });
    } finally {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
  });
});

router.get("/health", async (req, res) => {
  try {
    const { data } = await axios.get("http://127.0.0.1:5004/health");
    res.json({ success: true, service: data });
  } catch (err) {
    res.status(503).json({ success: false, service: "offline" });
  }
});

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = router;
