import dotenv from 'dotenv';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
let mongoose = require('mongoose');

// Debug: check what is imported
// console.log('Mongoose import:', mongoose);

// Handle ESM/CJS interop: get .default if present
if (mongoose && typeof mongoose.connect !== 'function' && mongoose.default && typeof mongoose.default.connect === 'function') {
  mongoose = mongoose.default;
}

const MONGODB_URI = "mongodb+srv://creators_shield:Creatorshield%40005@cluster0.gvezzd8.mongodb.net/creator_shield_db?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env or .env.local')
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    if (typeof mongoose.connect !== 'function') {
      throw new Error('mongoose.connect is not a function. Mongoose import problem.');
    }
    
    const connectWithRetry = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          console.log(`Attempting MongoDB connection (attempt ${i + 1}/${retries})`);
          return await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
            serverSelectionTimeoutMS: 30000, // 30 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
            connectTimeoutMS: 30000, // 30 seconds connection timeout
            maxPoolSize: 5, // Reduced pool size
            minPoolSize: 1,
            maxIdleTimeMS: 30000,
            retryWrites: true,
            retryReads: true,
            w: 'majority',
            wtimeout: 10000,
            // Add these options for better connection handling
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
        } catch (error) {
          console.error(`MongoDB connection attempt ${i + 1} failed:`, error);
          if (i === retries - 1) {
            console.error('All MongoDB connection attempts failed');
            throw error; // Throw on last attempt
          }
          // Wait 3 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    };
    
    cached.promise = connectWithRetry();
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
