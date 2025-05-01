const express = require("express");
const router = express.Router();
const EmergencySOS = require("../models/EmergencySOS");
const EmergencyContact  = require("../models/EmergencyContact");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { isLoggedIn } = require("../middlewares/isLoggedIn");
const upload = multer({ dest: "uploads/sos_audio/" });

router.post("/sos",isLoggedIn, upload.single("audio"), async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const audioPath = req.file.path;

    const newSOS = new EmergencySOS({
      user: req.user._id, // Assuming user is logged in
      audioPath,
      location: { lat, lng },
      status: "pending"
    });

    await newSOS.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving SOS:", err);
    res.status(500).json({ success: false });
  }
}); 
// Get contacts for logged-in user
router.get("/contacts", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const contacts = await EmergencyContact.find({ userId: req.user._id });
    const fixedContact = {
      name: "Disaster Helpline",
      phone: "7099774852",
      fixed: true,
    };
    res.json([fixedContact, ...contacts]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// Add contact for user
router.post("/contacts", async (req, res) => {
  const { name, phone } = req.body;
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const newContact = new EmergencyContact({
      name,
      phone,
      userId: req.user._id
    });
    await newContact.save();
    res.json({ success: true, contact: newContact });
  } catch (err) {
    res.status(500).json({ error: "Failed to save contact" });
  }
});

router.delete("/emergency/contacts/:phone", async (req, res) => {
    const { phone } = req.params;
    if (phone === "7099774852") return res.json({ success: false, message: "Protected number" });
  
    await Contact.deleteOne({ phone });
    res.json({ success: true });
  });
module.exports = router;