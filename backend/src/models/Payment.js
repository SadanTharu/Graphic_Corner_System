const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    clientId: { type: String, required: true },
    title: String,
    dueDate: Date,
    amount: Number,
    method: String,
    status: {
        type: String,
        enum: ['pending', 'paid', 'rejected', 'verified'],
        default: 'pending'
    },
    slipUrl: String,
    notes: String
}, { timestamps: true });
module.exports = mongoose.model('Payment', schema);