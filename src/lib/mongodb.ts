import mongoose from 'mongoose';

// Get MongoDB URI from environment variable, with fallback
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://creators_shield:Creatorshield%40005@cluster0.gvezzd8.mongodb.net/creator_shield_db?retryWrites=true&w=majority&appName=Cluster0";

console.log('🔌 MongoDB URI configured:', MONGODB_URI ? 'Yes' : 'No');

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env or .env.local')
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

let cached: Cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectToDatabase() {
  try {
    if (cached.conn) {
      console.log('✅ Using cached database connection');
      return cached.conn;
    }

    if (!cached.promise) {
      console.log('🔌 Creating new database connection...');
      console.log('🔌 Using URI:', MONGODB_URI.substring(0, 50) + '...');
      
      const connectWithRetry = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            console.log(`Attempting MongoDB connection (attempt ${i + 1}/${retries})`);
            
            const connection = await mongoose.connect(MONGODB_URI, {
              serverSelectionTimeoutMS: 30000,
              socketTimeoutMS: 45000,
              connectTimeoutMS: 30000,
              maxPoolSize: 5,
              minPoolSize: 1,
              maxIdleTimeMS: 30000,
              retryWrites: true,
              retryReads: true,
              w: 'majority',
              wtimeoutMS: 10000,
            });
            
            console.log('✅ MongoDB connected successfully');
            return connection;
          } catch (error) {
            console.error(`MongoDB connection attempt ${i + 1} failed:`, error);
            if (i === retries - 1) {
              console.error('All MongoDB connection attempts failed');
              throw error;
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
  } catch (error) {
    console.error('Error in connectToDatabase:', error);
    cached.promise = null;
    throw error;
  }
}

export default connectToDatabase;
