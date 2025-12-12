const mongoose = require('mongoose');
const schema = new mongoose.Schema({
clientId: { type: String, required: true },
title: String,
status: String,
deadline: Date,
finishedDate: Date,
driveLink: String,
notes: String
}, { timestamps: true });
module.exports = mongoose.model('Content', schema);