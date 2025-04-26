const Alert = require('../models/Disaster');

module.exports.getDisaster =async (req,res)=>{
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7); // Subtract 7 days from today
    
    const alerts = await Alert.find({
      eventDate: { $gte: sevenDaysAgo } // Get alerts in the last 7 days
    }).sort({ eventDate: -1 }); // Sort in descending order by event date
    
    res.render('../../frontend/views/disasterAlerts',{alerts, user: req.user });
};

