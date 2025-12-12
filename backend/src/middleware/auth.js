const jwt = require('jsonwebtoken');
const Client = require('../models/Client');


module.exports = async function(req, res, next){
const token = req.header('Authorization')?.replace('Bearer ','') || req.query.token;
if(!token) return res.status(401).json({ message: 'No token' });
try{
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = await Client.findById(decoded.id);
if(!user) return res.status(401).json({ message: 'Invalid token' });
req.user = user;
next();
}catch(err){
res.status(401).json({ message: 'Auth failed' });
}
}