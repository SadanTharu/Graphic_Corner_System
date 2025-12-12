const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');


const app = express();
app.use(cors());
app.use(express.json());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
useNewUrlParser: true,
useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error', err));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/contents', require('./routes/contents'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/services', require('./routes/services'));
app.use('/api/contact', require('./routes/contact'));


module.exports = app;