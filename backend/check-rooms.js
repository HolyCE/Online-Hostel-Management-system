const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Room = require('./src/models/Room');
const Hall = require('./src/models/Hall');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Check first few rooms
    const rooms = await Room.find().limit(5);
    console.log('Sample rooms:');
    for (const r of rooms) {
      console.log(`  Room ${r.roomNumber}:`);
      console.log(`    - Hall ID: ${r.hall || 'NOT SET'}`);
      console.log(`    - Block: ${r.blockName}`);
      console.log(`    - Price: ${r.price || r.basePrice}`);
    }
    
    // Check hall counts
    const halls = await Hall.find();
    console.log('\n📊 Hall room counts:');
    for (const hall of halls) {
      const count = await Room.countDocuments({ hall: hall._id });
      console.log(`  ${hall.name}: ${count} rooms`);
    }
    
    // Check total rooms
    const totalRooms = await Room.countDocuments();
    console.log(`\n📊 Total rooms in database: ${totalRooms}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

check();
