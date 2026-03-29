const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Room = require('./src/models/Room');
const Hall = require('./src/models/Hall');

async function updateRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all halls
    const halls = await Hall.find();
    const hallMap = {};
    halls.forEach(h => {
      hallMap[h.name] = h;
      console.log(`Hall: ${h.name} (${h.code})`);
    });

    // Get all rooms
    const rooms = await Room.find();
    console.log(`\nFound ${rooms.length} rooms to update\n`);

    let updated = 0;
    
    for (const room of rooms) {
      let hallToAssign = null;
      const roomNumber = room.roomNumber || '';
      const blockName = room.blockName?.toUpperCase() || '';
      
      // Map rooms to halls based on room number and block
      if (roomNumber.startsWith('A')) {
        hallToAssign = hallMap['Welch Hall'];
      } else if (roomNumber.startsWith('B')) {
        hallToAssign = hallMap['Winslow Hall'];
      } else if (roomNumber.startsWith('C')) {
        hallToAssign = hallMap['Churchill Hall'];
      } else if (roomNumber.startsWith('D')) {
        hallToAssign = hallMap['Nelson Hall'];
      }
      
      if (hallToAssign) {
        // Use the existing price as base price
        const sessionPrice = room.price || 150000;
        const semesterPrice = Math.round(sessionPrice / 2);
        const monthlyPrice = Math.round(semesterPrice / 3);
        const weeklyPrice = Math.round(monthlyPrice / 4);
        
        await Room.updateOne(
          { _id: room._id },
          { 
            $set: { 
              hall: hallToAssign._id,
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
        updated++;
        console.log(`✅ Room ${room.roomNumber} -> ${hallToAssign.name} (Price: ₦${sessionPrice.toLocaleString()})`);
      } else {
        console.log(`⚠️ Room ${room.roomNumber} - No matching hall`);
      }
    }
    
    console.log(`\n✅ Updated ${updated} rooms`);
    
    // Verify the updates
    console.log('\n📊 Final hall room counts:');
    for (const hall of halls) {
      const count = await Room.countDocuments({ hall: hall._id });
      console.log(`  ${hall.name}: ${count} rooms`);
    }
    
    // Show sample of updated rooms
    const sampleRooms = await Room.find({ hall: { $ne: null } }).limit(3);
    console.log('\n📊 Sample updated rooms:');
    for (const room of sampleRooms) {
      const hall = await Hall.findById(room.hall);
      console.log(`  Room ${room.roomNumber} -> ${hall?.name} | Price: ₦${room.basePrice.toLocaleString()}`);
      console.log(`    Weekly: ₦${room.prices?.weekly}, Monthly: ₦${room.prices?.monthly}, Semester: ₦${room.prices?.semester}, Session: ₦${room.prices?.session}`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

updateRooms();
