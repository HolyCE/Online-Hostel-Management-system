const mongoose = require('mongoose');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(chalk.red.bold('❌ UNCAUGHT EXCEPTION! 💥 Shutting down...'));
  console.log(chalk.red(err.name, err.message));
  console.log(chalk.red(err.stack));
  process.exit(1);
});

dotenv.config({ path: './.env' });

const app = require('./app');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_management');
    
    console.log(chalk.green.bold('✅ MongoDB Connected Successfully!'));
    console.log(chalk.cyan(`📊 Host: ${conn.connection.host}`));
    console.log(chalk.cyan(`📊 Database: ${conn.connection.name}`));
    console.log(chalk.cyan(`📊 Port: ${conn.connection.port}`));
    
    return conn;
  } catch (error) {
    console.log(chalk.red.bold('❌ Database connection error:'));
    console.log(chalk.red(error.message));
    console.log(chalk.yellow.bold('\n💡 Troubleshooting tips:'));
    console.log(chalk.yellow('1. Make sure MongoDB is installed: sudo systemctl status mongod'));
    console.log(chalk.yellow('2. Start MongoDB: sudo systemctl start mongod'));
    console.log(chalk.yellow('3. Check if MongoDB is listening: sudo netstat -tlnp | grep 27017'));
    console.log(chalk.yellow('4. Try connecting with: mongosh --eval "db.runCommand({ping: 1})"'));
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

// Connect to database then start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(chalk.yellow.bold(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
    console.log(chalk.green(`📝 API URL: http://localhost:${PORT}`));
    console.log(chalk.green(`💊 Health check: http://localhost:${PORT}/health`));
    console.log(chalk.gray('🔄 Press Ctrl+C to stop\n'));
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.log(chalk.red.bold('❌ UNHANDLED REJECTION! 💥 Shutting down...'));
    console.log(chalk.red(err.name, err.message));
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle SIGTERM
  process.on('SIGTERM', () => {
    console.log(chalk.yellow('👋 SIGTERM RECEIVED. Shutting down gracefully'));
    server.close(() => {
      console.log(chalk.red('💥 Process terminated!'));
    });
  });
}).catch(err => {
  console.error(chalk.red('❌ Failed to connect to database:'));
  console.error(chalk.red(err));
});
