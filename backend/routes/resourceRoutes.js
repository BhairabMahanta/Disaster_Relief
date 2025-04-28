const express = require('express');
const router = express.Router();
const ResourceEmergency = require("../models/ResourceEmergency");
const { isLoggedIn } = require('../middlewares/isLoggedIn');

router.get("/",isLoggedIn, async (req, res) => {
    try {
        const allContacts = await ResourceEmergency.find({ userId: req.user._id });
        res.render('guide', { allContacts });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.post("/addcontact", async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/auth/login");  
        }

        const { name, number } = req.body;
        const newContact = new ResourceEmergency({
            name,
            number,
            userId: req.user._id
        });

        await newContact.save();  
        res.redirect("/resources");  
    } catch (err) {
        console.error(err);
        res.redirect("/resources");
    }
});

module.exports = router;