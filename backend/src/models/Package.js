const mongoose = require('mongoose');
const schema = new mongoose.Schema({
clientId: { type: String, required: true },
packageName: String,
startDate: Date,
endDate: Date,
price: Number,
revenue: Number,
notes: String
}, { timestamps: true });
module.exports = mongoose.model('Package', schema);