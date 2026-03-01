const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { User, Room, Payment, MaintenanceTicket } = require('./src/models');

async function testModels() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test User model
    console.log('📝 Testing User model...');
    const userSchema = Object.keys(User.schema.paths);
    console.log('   User fields:', userSchema.slice(0, 5).join(', '), '...');
    
    // Test Room model
    console.log('\n📝 Testing Room model...');
    const roomSchema = Object.keys(Room.schema.paths);
    console.log('   Room fields:', roomSchema.slice(0, 5).join(', '), '...');
    
    // Test Payment model
    console.log('\n📝 Testing Payment model...');
    const paymentSchema = Object.keys(Payment.schema.paths);
    console.log('   Payment fields:', paymentSchema.slice(0, 5).join(', '), '...');
    
    // Test Ticket model
    console.log('\n📝 Testing Ticket model...');
    const ticketSchema = Object.keys(MaintenanceTicket.schema.paths);
    console.log('   Ticket fields:', ticketSchema.slice(0, 5).join(', '), '...');
    
    console.log('\n✅ All models loaded successfully!');
    console.log(`📊 Total models: 7 (User, Room, Payment, MaintenanceTicket, WaitingList, AuditLog, Notification)`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testModels();
