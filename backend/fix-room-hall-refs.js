const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function fixRoomHallRefs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB\n');

    // Get all halls
    const halls = await db.collection('halls').find({}).toArray();
    const hallMap = {};
    halls.forEach(h => {
      hallMap[h.name] = h._id;
      console.log(`Hall: ${h.name} -> ${h._id}`);
    });

    // Get all rooms
    const rooms = await db.collection('rooms').find({}).toArray();
    console.log(`\nFound ${rooms.length} rooms\n`);

    let updated = 0;

    for (const room of rooms) {
      const roomNumber = room.roomNumber || '';
      let hallId = null;
      let hallName = '';
      
      // Map room numbers to halls
      if (roomNumber.startsWith('A')) {
        hallName = 'Welch Hall';
      } else if (roomNumber.startsWith('B')) {
        hallName = 'Winslow Hall';
      } else if (roomNumber.startsWith('C')) {
        hallName = 'Churchill Hall';
      } else if (roomNumber.startsWith('D')) {
        hallName = 'Nelson Hall';
      }
      
      hallId = hallMap[hallName];
      
      if (hallId) {
        const result = await db.collection('rooms').updateOne(
          { _id: room._id },
          { $set: { hall: hallId } }
        );
        
        if (result.modifiedCount > 0) {
          updated++;
          console.log(`✅ Updated room ${room.roomNumber} -> ${hallName}`);
        }
      }
    }
    
    console.log(`\n✅ Updated ${updated} rooms`);
    
    // Verify
    console.log('\n📊 Verification:');
    for (const hall of halls) {
      const count = await db.collection('rooms').countDocuments({ hall: hall._id });
      console.log(`  ${hall.name}: ${count} rooms`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

fixRoomHallRefs();
