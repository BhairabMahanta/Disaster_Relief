const express = require('express');
const router = express.Router();
const {getDisaster,subscribe,unsubscribe, getDisastersAPI} = require('../controllers/disasterController');
const nodemailer = require('nodemailer');
const Alert = require('../models/Disaster');
const { isLoggedIn } = require('../middlewares/isLoggedIn');
const User = require('../models/User'); 
const fetchAndStoreGdacsData = require('../utils/fetchGdacs');

router.get('/',getDisaster);
router.get('/getDisasters', getDisastersAPI); // ✅ This is the endpoint for Flutter
router.post('/subscribe', isLoggedIn,subscribe);
router.post('/unsubscribe', isLoggedIn,unsubscribe);

module.exports = router;