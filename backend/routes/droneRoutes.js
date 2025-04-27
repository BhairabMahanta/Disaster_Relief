const express = require('express');
const router = express.Router();
const Alert = require('../models/Disaster');
const { isLoggedIn } = require('../middlewares/isLoggedIn');
const User = require('../models/User'); 
const bodyParser = require('body-parser');
const cron = require("node-cron");
const {getDrone} = require('../controllers/droneController');

router.get("/",isLoggedIn,getDrone);
  


module.exports = router;
  