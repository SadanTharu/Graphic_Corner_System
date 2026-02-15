const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/graphic_corner';

const clearData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const collections = ['users', 'services', 'orders', 'tasks', 'transactions'];
    
    for (const col of collections) {
      const result = await mongoose.connection.db.collection(col).deleteMany({});
      console.log(`🗑️  Deleted ${result.deletedCount} documents from ${col}`);
    }

    console.log('\n✅ All dummy data removed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
};

clearData();
