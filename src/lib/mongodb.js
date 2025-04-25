import mongoose from 'mongoose';

// Get the MongoDB URI from environment variable or use a default for development
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vaghasiapriyanshi2907:priyanshi@cluster0.zzzrwp4.mongodb.net/';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    try {
      console.log('Attempting to connect to MongoDB...');
      
      // Encode the password part of the URI to handle special characters
      const encodedUri = MONGODB_URI.replace(
        /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
        (match, username, password) => {
          const encodedPassword = encodeURIComponent(password);
          return `mongodb+srv://${username}:${encodedPassword}@`;
        }
      );
      
      console.log('Using encoded MongoDB URI');
      
      cached.promise = mongoose.connect(encodedUri, opts).then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);
      cached.promise = null;
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Error in cached connection:', e);
    throw e;
  }

  return cached.conn;
}

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

export default connectDB; 