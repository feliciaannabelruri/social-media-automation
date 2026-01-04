const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Hapus opsi deprecated: useNewUrlParser dan useUnifiedTopology
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('\n💡 MongoDB Tips:');
    console.log('1. Pastikan MongoDB sudah terinstall dan running');
    console.log('2. Atau gunakan MongoDB Atlas (cloud): https://cloud.mongodb.com');
    console.log('3. Update MONGODB_URI di file .env\n');
    process.exit(1);
  }
};

module.exports = connectDB;