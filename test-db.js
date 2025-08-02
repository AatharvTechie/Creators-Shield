const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://creators_shield:Creatorshield%40005@cluster0.gvezzd8.mongodb.net/creator_shield_db?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    console.log('🔌 URI:', MONGODB_URI.substring(0, 50) + '...');
    
    await mongoose.connect(MONGODB_URI, {
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
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test a simple query
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections in database:', collections.map(c => c.name));
    
    // Test the creators collection
    const creatorsCollection = db.collection('creators');
    const userCount = await creatorsCollection.countDocuments();
    console.log('📊 Total users in creators collection:', userCount);
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection(); 