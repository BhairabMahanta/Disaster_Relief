// backend/fetchGraph.js
const Alert = require('../models/Disaster'); // Adjust path if needed

async function getGraphData(req, res) {
  try {
    const alerts = await Alert.find({}); // Fetch all alerts

    const counts = {
      Earthquake: 0,
      Tsunami: 0,
      Flood: 0,
      Cyclone: 0,
      Wildfire: 0,
      Other: 0,
    };

    alerts.forEach(alert => {
      const title = alert.title.toLowerCase();

      if (title.includes('earthquake')) counts.Earthquake++;
      else if (title.includes('tsunami')) counts.Tsunami++;
      else if (title.includes('flood')) counts.Flood++;
      else if (title.includes('cyclone') || title.includes('typhoon') || title.includes('hurricane')) counts.Cyclone++;
      else if (title.includes('wildfire')) counts.Wildfire++;
      else counts.Other++;
    });

    res.json(counts);
  } catch (error) {
    console.error('Error fetching graph data:', error.message);
    res.status(500).json({ error: 'Failed to fetch graph data' });
  }
}
async function getDeathsData(req, res) {
  try {
    // Fetch all the alerts from the database
    const alerts = await Alert.find({});
    
    // Initialize a container to store the data
    const disasterData = {
      Earthquake: 0,
      Tsunami: 0,
      Cyclone: 0,
      Flood: 0,
      Wildfire: 0,
      Other: 0,
    };

    // Process each alert to aggregate data
    alerts.forEach(alert => {
      const title = alert.title.toLowerCase();
      // Improved death count parsing
      let deaths = 0;
      if (alert.summary && alert.summary.includes('deaths')) {
        const deathString = alert.summary.match(/(\d+)\s?deaths/); // Regex to find the death count
        if (deathString) deaths = parseInt(deathString[1], 10);
      }

      // Update disaster counts based on title and parsed deaths
      if (title.includes('earthquake')) disasterData.Earthquake += deaths;
      else if (title.includes('tsunami')) disasterData.Tsunami += deaths;
      else if (title.includes('cyclone') || title.includes('hurricane')) disasterData.Cyclone += deaths;
      else if (title.includes('flood')) disasterData.Flood += deaths;
      else if (title.includes('wildfire')) disasterData.Wildfire += deaths;
      else disasterData.Other += deaths;
    });

    // Send the data back as JSON for the frontend
    res.json(disasterData);
  } catch (error) {
    console.error('Error fetching graph data:', error.message);
    res.status(500).json({ error: 'Failed to fetch graph data' });
  }
}
module.exports = {getGraphData,getDeathsData};
