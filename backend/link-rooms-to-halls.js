const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Hall = require('./src/models/Hall');
const Room = require('./src/models/Room');

async function linkRoomsToHalls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all halls
    const halls = await Hall.find();
    console.log('\n📊 Halls found:');
    halls.forEach(h => console.log(`  - ${h.name} (${h.code})`));

    // Get all rooms
    const rooms = await Room.find();
    console.log(`\n📊 Found ${rooms.length} rooms to update`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const room of rooms) {
      let hallToAssign = null;
      const blockName = room.blockName?.toUpperCase() || '';
      const roomNumber = room.roomNumber || '';
      
      // Map blocks to halls based on block name and room number prefix
      if (blockName.includes('A') || roomNumber.startsWith('A')) {
        hallToAssign = halls.find(h => h.name === 'Welch Hall');
      } else if (blockName.includes('B') || roomNumber.startsWith('B')) {
        hallToAssign = halls.find(h => h.name === 'Winslow Hall');
      } else if (blockName.includes('C') || roomNumber.startsWith('C')) {
        hallToAssign = halls.find(h => h.name === 'Churchill Hall');
      } else if (blockName.includes('D') || roomNumber.startsWith('D')) {
        hallToAssign = halls.find(h => h.name === 'Nelson Hall');
      }

      if (hallToAssign) {
        // Calculate prices based on full session (24 weeks)
        const sessionPrice = room.price || room.basePrice || 150000;
        const semesterPrice = Math.round(sessionPrice / 2);
        const monthlyPrice = Math.round(semesterPrice / 3);
        const weeklyPrice = Math.round(monthlyPrice / 4);
        
        await Room.findByIdAndUpdate(room._id, {
          hall: hallToAssign._id,
          basePrice: sessionPrice,
          prices: {
            weekly: weeklyPrice,
            monthly: monthlyPrice,
            semester: semesterPrice,
            session: sessionPrice
          }
        });
        updatedCount++;
        console.log(`  ✅ Room ${room.roomNumber} (${room.blockName}) -> ${hallToAssign.name}`);
      } else {
        skippedCount++;
        console.log(`  ⚠️ Room ${room.roomNumber} (${room.blockName}) - No matching hall`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  - Updated: ${updatedCount} rooms`);
    console.log(`  - Skipped: ${skippedCount} rooms`);
    
    // Verify counts per hall
    console.log(`\n📊 Room counts per hall:`);
    for (const hall of halls) {
      const count = await Room.countDocuments({ hall: hall._id });
      console.log(`  - ${hall.name}: ${count} rooms`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

linkRoomsToHalls();
