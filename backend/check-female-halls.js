const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB\n');
    
    const femaleHalls = await db.collection('halls').find({ gender: 'female' }).toArray();
    console.log('Female Halls:');
    femaleHalls.forEach(h => {
      console.log(`  ${h.name} (${h.code})`);
    });
    
    console.log('\nRooms currently in female halls:');
    for (const hall of femaleHalls) {
      const count = await db.collection('rooms').countDocuments({ hall: hall._id });
      console.log(`  ${hall.name}: ${count} rooms`);
    }
    
    const totalRooms = await db.collection('rooms').countDocuments();
    console.log(`\nTotal rooms: ${totalRooms}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

check();
