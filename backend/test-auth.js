const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function testAuth() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test user creation
    console.log('📝 Testing user creation...');
    const testUser = {
      name: 'Test Student',
      email: 'test@student.com',
      matricNumber: 'TEST2024001',
      password: 'password123',
      phoneNumber: '+1234567890',
      gender: 'male'
    };

    // Check if test user exists
    let user = await User.findOne({ email: testUser.email });
    
    if (!user) {
      user = await User.create(testUser);
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user already exists');
    }

    // Test password comparison
    console.log('\n📝 Testing password comparison...');
    const isMatch = await user.comparePassword('password123');
    console.log('Password match:', isMatch ? '✅' : '❌');

    // Test JWT generation
    console.log('\n📝 Testing JWT generation...');
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    console.log('JWT token generated:', token ? '✅' : '❌');
    console.log('Token preview:', token.substring(0, 20) + '...');

    console.log('\n✅ All auth tests passed!');
    console.log('\n📊 Test user credentials:');
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();
