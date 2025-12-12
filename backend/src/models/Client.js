const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const clientSchema = new mongoose.Schema({
clientId: { type: String, required: true, unique: true },
name: String,
contact: String,
email: { type: String, required: true, unique: true },
status: String,
password: { type: String, required: true },
role: { type: String, enum: ['client','admin'], default: 'client' }
}, { timestamps: true });


clientSchema.pre('save', async function(next){
if(!this.isModified('password')) return next();
const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password, salt);
next();
});


clientSchema.methods.comparePassword = async function(candidate){
return bcrypt.compare(candidate, this.password);
}


module.exports = mongoose.model('Client', clientSchema);