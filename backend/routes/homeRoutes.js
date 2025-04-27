const express = require('express');
const router = express.Router();
const Alert = require('../models/Disaster');
const { isLoggedIn } = require('../middlewares/isLoggedIn');
const User = require('../models/User'); 
const {home,map,disasterCounts} = require('../controllers/homeController');
const { getGraphData, getDeathsData } = require('../utils/fetchGraph'); 
const bodyParser = require('body-parser');
const cron = require("node-cron");
const fetchAndStoreGdacsData = require('../utils/fetchGdacs');
const { sendDroneDispatchEmail, sendDroneCompletionEmail } = require('../utils/sendDroneEmail');
const Mission = require('../models/Mission');

router.get("/", home);
router.get('/map',map );
router.get('/api/disasters/count-per-location',disasterCounts);
router.post('/request-drone', async (req, res) => {
    const { baseLat, baseLon, targetLat, targetLon, priority } = req.body;
  
    try {
      const newMission = new Mission({
        baseLat,
        baseLon,
        targetLat,
        targetLon,
        currentLat: baseLat,
        currentLon: baseLon,
        priority,
        status: 'In Progress'
      });
  
      await newMission.save();
  
      await sendDroneDispatchEmail(
        req.user.email,
        req.user.name,
        baseLat,
        baseLon,
        targetLat,
        targetLon,
        priority
      );
  
      simulateDroneMovement(newMission._id, req.user.email, req.user.name);
  
      res.json({ message: 'Drone mission started successfully!', missionId: newMission._id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error starting drone mission.' });
    }
  });
  
  function getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const toRad = angle => (angle * Math.PI) / 180;
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c;
  }

  async function simulateDroneMovement(missionId, userEmail, userName) {
    const rangeThreshold = 50; 
  
    const moveInterval = setInterval(async () => {
      try {
        const mission = await Mission.findById(missionId);
        if (!mission) {
          clearInterval(moveInterval);
          console.log(`Mission ${missionId} not found, stopping simulation.`);
          return;
        }
  
        const distanceToTarget = getDistanceMeters(
          mission.currentLat,
          mission.currentLon,
          mission.targetLat,
          mission.targetLon
        );
  
        console.log(`Mission ${missionId} distance to target: ${distanceToTarget.toFixed(2)} meters`);
  
        if (distanceToTarget <= rangeThreshold) {
          console.log(`Mission ${missionId} is within ${rangeThreshold} meters of the target, completing mission.`);
          

          mission.currentLat = mission.targetLat;
          mission.currentLon = mission.targetLon;
          mission.status = 'Completed';
          await mission.save();
          clearInterval(moveInterval);
  
          // Send completion email
          try {
            await sendDroneCompletionEmail(userEmail, userName, mission.targetLat, mission.targetLon);
            console.log('Completion email sent.');
          } catch (emailErr) {
            console.error(`Failed to send completion email for mission ${missionId}:`, emailErr);
          }
          return;
        }
  
        const stepSize = Math.min(0.1, distanceToTarget / 1000);
        const latDiff = mission.targetLat - mission.currentLat;
        const lonDiff = mission.targetLon - mission.currentLon;

        const latMove = Math.sign(latDiff) * stepSize;  
        const lonMove = Math.sign(lonDiff) * stepSize; 
  
        mission.currentLat += latMove;
        mission.currentLon += lonMove;
  
        await mission.save();
        console.log(`Mission ${missionId} updated position: (${mission.currentLat.toFixed(6)}, ${mission.currentLon.toFixed(6)})`);
      } catch (error) {
        console.error(`Error in simulateDroneMovement for mission ${missionId}:`, error);
        clearInterval(moveInterval);
      }
    }, 500); // Run every 500 ms to simulate drone movement
};


// 📡 Get mission status
router.get('/api/missions/:id', async (req, res) => {
    try {
      const mission = await Mission.findById(req.params.id);
      if (!mission) {
        return res.status(404).json({ message: 'Mission not found' });
      }
      res.json(mission);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;