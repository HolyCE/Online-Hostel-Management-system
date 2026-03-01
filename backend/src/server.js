const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('colors');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('❌ UNCAUGHT EXCEPTION! 💥 Shutting down...'.red.bold);
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });

const app = require('./app');

// MongoDB Atlas Connection
const connectDB = async () => {
  try {
    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not found in .env file'.red);
      console.log('Please add your MongoDB Atlas connection string to .env'.yellow);
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB Atlas...'.yellow);
    
    // Connect to MongoDB Atlas (no deprecated options needed)
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB Atlas Connected Successfully!'.green.bold);
    console.log(`📊 Host: ${conn.connection.host}`.cyan);
    console.log(`📊 Database: ${conn.connection.name}`.cyan);
    
    return conn;
  } catch (error) {
    console.log('❌ MongoDB Atlas Connection Error:'.red.bold);
    console.log(error.message.red);
    console.log('\n🔍 Troubleshooting Tips:'.yellow);
    console.log('1. Check if username/password in MONGODB_URI is correct'.yellow);
    console.log('2. Make sure your IP address is whitelisted in MongoDB Atlas'.yellow);
    console.log('3. Verify the database name is correct'.yellow);
    console.log('4. Check if your cluster is running (free tier may pause after inactivity)'.yellow);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas then start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold);
    console.log(`📝 API URL: http://localhost:${PORT}`.green);
    console.log(`💊 Health check: http://localhost:${PORT}/health`.green);
    console.log(`🔄 Press Ctrl+C to stop\n`.gray);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.log('❌ UNHANDLED REJECTION! 💥 Shutting down...'.red.bold);
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle SIGTERM
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully'.yellow);
    server.close(() => {
      console.log('💥 Process terminated!'.red);
    });
  });
});
