const express = require('express');
const router = express.Router();
const NgoFeedback = require('../models/NgoFeedback'); // Import Feedback model

// Admin Feedback Dashboard
router.get('/ngo/feedbacks', async (req, res) => {
  try {
    const feedbacks = await NgoFeedback.find().populate('user').sort({ createdAt: -1 });
    res.render('adminNgoFeedbacks', { feedbacks });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

router.delete('/ngo/feedbacks/:id', async (req, res) => {
    try {
      await NgoFeedback.findByIdAndDelete(req.params.id);
      console.log('Feedback deleted successfully');
      res.redirect('/admin/ngo/feedbacks');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.redirect('/admin/ngo/feedbacks');
    }
  });

module.exports = router;
