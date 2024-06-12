// models/Temporary.js

const mongoose = require('mongoose');

const TemporarySchema = new mongoose.Schema({
    tempPassword: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 // The document will automatically be removed after 60 seconds
    }
});

module.exports = mongoose.models.Temporary || mongoose.model('Temporary', TemporarySchema);
