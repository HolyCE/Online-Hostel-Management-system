const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log('📊 Users in database:\n');
    users.forEach(user => {
      console.log(`- Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Status: ${user.isActive ? 'Active' : 'Inactive'}`);
      console.log('  ---');
    });
    
    console.log(`\n📈 Total: ${users.length} users`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUsers();
