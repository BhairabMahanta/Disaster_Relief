const User = require('../models/User'); 
const Alert = require('../models/Disaster');
const { getGraphData, getDeathsData } = require('../utils/fetchGraph'); 
const bodyParser = require('body-parser');
const cron = require("node-cron");
const fetchAndStoreGdacsData = require('../utils/fetchGdacs');

module.exports.home = async (req, res) => {
    const disasters = await Alert.find();
    res.render("home", { disasters });
};

module.exports.map = async (req, res) => {
  try {
    const disasters = await Alert.find();  // Fetch all disaster data from DB
    res.render('disaster_map', { disasters });
  } catch (err) {
    res.status(500).send(err);
  }
};

module.exports.disasterCounts =  async (req, res) => {
    try {
      const disastersCount = await Alert.aggregate([
        {
          $group: {
            _id: "$location", // Group by location
            count: { $sum: 1 } // Count the occurrences
          }
        },
        { $sort: { count: -1 } } // Sort by count in descending order
      ]);
      res.json(disastersCount); // Send the results back to the client
    } catch (err) {
      res.status(500).send('Error fetching disaster data');
    }
};
