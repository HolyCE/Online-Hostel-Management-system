const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function fixRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB\n');

    // Get all halls
    const halls = await db.collection('halls').find({}).toArray();
    console.log('Halls found:');
    halls.forEach(h => {
      console.log(`  ${h.name} (${h.code}) -> ${h._id}`);
    });

    // Create hall ID map
    const hallIdMap = {
      'Welch Hall': halls.find(h => h.name === 'Welch Hall')?._id,
      'Winslow Hall': halls.find(h => h.name === 'Winslow Hall')?._id,
      'Churchill Hall': halls.find(h => h.name === 'Churchill Hall')?._id,
      'Nelson Hall': halls.find(h => h.name === 'Nelson Hall')?._id,
      'Queen Esther Hall': halls.find(h => h.name === 'Queen Esther Hall')?._id,
      'Cleopatra Hall': halls.find(h => h.name === 'Cleopatra Hall')?._id,
      'Beyoncé Hall': halls.find(h => h.name === 'Beyoncé Hall')?._id,
      'Mae Jemison Hall': halls.find(h => h.name === 'Mae Jemison Hall')?._id
    };

    console.log('\nHall IDs mapped:');
    Object.keys(hallIdMap).forEach(name => {
      console.log(`  ${name}: ${hallIdMap[name]}`);
    });

    // Get all rooms
    const rooms = await db.collection('rooms').find({}).toArray();
    console.log(`\nFound ${rooms.length} rooms to update\n`);

    let updated = 0;
    let failed = 0;

    for (const room of rooms) {
      const roomNumber = room.roomNumber || '';
      let hallId = null;
      
      // Determine hall based on room number prefix
      if (roomNumber.startsWith('A')) {
        hallId = hallIdMap['Welch Hall'];
      } else if (roomNumber.startsWith('B')) {
        hallId = hallIdMap['Winslow Hall'];
      } else if (roomNumber.startsWith('C')) {
        hallId = hallIdMap['Churchill Hall'];
      } else if (roomNumber.startsWith('D')) {
        hallId = hallIdMap['Nelson Hall'];
      }
      
      if (hallId) {
        // Use existing price or default
        const sessionPrice = room.price || 150000;
        const semesterPrice = Math.round(sessionPrice / 2);
        const monthlyPrice = Math.round(semesterPrice / 3);
        const weeklyPrice = Math.round(monthlyPrice / 4);
        
        const result = await db.collection('rooms').updateOne(
          { _id: room._id },
          { 
            $set: { 
              hall: hallId,
              basePrice: sessionPrice,
              prices: {
                weekly: weeklyPrice,
                monthly: monthlyPrice,
                semester: semesterPrice,
                session: sessionPrice
              }
            }
          }
        );
        
        if (result.modifiedCount > 0) {
          updated++;
          console.log(`✅ Room ${room.roomNumber} -> ${Object.keys(hallIdMap).find(key => hallIdMap[key] === hallId)}`);
        } else {
          console.log(`⚠️ Room ${room.roomNumber} - No changes made`);
          failed++;
        }
      } else {
        console.log(`❌ Room ${room.roomNumber} - No hall mapping found`);
        failed++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Updated: ${updated} rooms`);
    console.log(`  - Failed/Skipped: ${failed} rooms`);
    
    // Verify the updates
    console.log('\n📊 Verification - Hall room counts:');
    for (const hall of halls) {
      const count = await db.collection('rooms').countDocuments({ hall: hall._id });
      console.log(`  ${hall.name}: ${count} rooms`);
    }
    
    // Check a specific room
    const sampleRoom = await db.collection('rooms').findOne({ roomNumber: 'A101' });
    console.log('\n📊 Sample room A101 after update:');
    console.log(`  Hall ID: ${sampleRoom.hall}`);
    console.log(`  Base Price: ${sampleRoom.basePrice}`);
    console.log(`  Prices:`, sampleRoom.prices);
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

fixRooms();
