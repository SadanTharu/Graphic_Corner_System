const mongoose = require('mongoose');
const schema = new mongoose.Schema({
clientId: { type: String, required: true },
title: String,
dueDate: Date,
amount: Number,
method: String,
status: String
}, { timestamps: true });
module.exports = mongoose.model('Payment', schema);