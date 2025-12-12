const mongoose = require('mongoose');
const schema = new mongoose.Schema({
title: String,
description: String,
price: Number,
duration: String,
icon: String,
featured: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Service', schema);