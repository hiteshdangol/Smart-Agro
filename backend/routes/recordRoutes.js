const express = require('express');
const { addRecord, getAllfarmer, deleteFarmer, getAllCrop, getRecords} = require('../controllers/recordController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getRecords); // Fetch all records
router.post('/', authMiddleware, addRecord); // Add a new record
router.get("/getAllFarmer",getAllfarmer);
router.delete("/deleteFarmer/:email",deleteFarmer);
router.get("/getAllCrop",getAllCrop)



module.exports = router;
