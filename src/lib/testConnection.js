import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://vaghasiapriyanshi2907:priyanshi@cluster0.zzzrwp4.mongodb.net/';

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB!');
    
    // Test if we can access the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

testConnection(); 