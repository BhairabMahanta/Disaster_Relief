const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    number: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // References the User model
        required: true
    }
}, { timestamps: true });

const ResourceEmergency = mongoose.model('ResourceEmergency', contactSchema);

module.exports = ResourceEmergency;
