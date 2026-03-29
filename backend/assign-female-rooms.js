const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function assignFemaleRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB\n');

    // Get all halls
    const halls = await db.collection('halls').find({}).toArray();
    
    // Create hall ID maps
    const maleHallIds = {};
    const femaleHallIds = {};
    
    halls.forEach(h => {
      if (h.gender === 'male') {
        maleHallIds[h.name] = h._id;
      } else {
        femaleHallIds[h.name] = h._id;
      }
    });
    
    console.log('Male Halls:');
    Object.keys(maleHallIds).forEach(name => console.log(`  ${name}`));
    console.log('\nFemale Halls:');
    Object.keys(femaleHallIds).forEach(name => console.log(`  ${name}`));
    
    // Get all rooms
    const rooms = await db.collection('rooms').find({}).toArray();
    console.log(`\nFound ${rooms.length} total rooms\n`);
    
    // Mapping: male hall -> female hall
    const hallMapping = {
      'Welch Hall': 'Queen Esther Hall',
      'Winslow Hall': 'Cleopatra Hall',
      'Churchill Hall': 'Beyoncé Hall',
      'Nelson Hall': 'Mae Jemison Hall'
    };
    
    let movedCount = 0;
    let keptCount = 0;
    
    for (const room of rooms) {
      const roomNumber = room.roomNumber || '';
      const currentHallId = room.hall;
      
      // Find which hall this room currently belongs to
      let currentHallName = null;
      for (const [hallName, hallId] of Object.entries(maleHallIds)) {
        if (hallId.toString() === currentHallId?.toString()) {
          currentHallName = hallName;
          break;
        }
      }
      
      if (currentHallName && hallMapping[currentHallName]) {
        const femaleHallName = hallMapping[currentHallName];
        const femaleHallId = femaleHallIds[femaleHallName];
        
        // Extract room number for splitting
        const roomNumMatch = roomNumber.match(/\d+/);
        const roomNum = roomNumMatch ? parseInt(roomNumMatch[0]) : 0;
        
        // Even numbered rooms go to female halls, odd stay in male halls
        if (roomNum % 2 === 0) {
          // Move to female hall
          await db.collection('rooms').updateOne(
            { _id: room._id },
            { $set: { hall: femaleHallId } }
          );
          movedCount++;
          console.log(`✅ Room ${room.roomNumber} moved from ${currentHallName} -> ${femaleHallName}`);
        } else {
          keptCount++;
          console.log(`   Room ${room.roomNumber} stays in ${currentHallName}`);
        }
      } else {
        console.log(`⚠️ Room ${room.roomNumber} - no mapping found (hall: ${currentHallId})`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Moved to female halls: ${movedCount} rooms`);
    console.log(`  - Remained in male halls: ${keptCount} rooms`);
    
    // Verify final counts
    console.log('\n📊 Final Hall Room Counts:');
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

assignFemaleRooms();
