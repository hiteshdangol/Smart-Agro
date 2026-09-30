const express = require('express');
const router = express.Router();
const { getMedicinesByDisease, getRecommendedProducts } = require('../controllers/medicineController');

router.get('/:diseaseName', getMedicinesByDisease);
router.get('/:diseaseName/products', getRecommendedProducts);

module.exports = router;
