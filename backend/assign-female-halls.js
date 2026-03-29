const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function assignFemaleHalls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB\n');

    // Get all halls
    const halls = await db.collection('halls').find({}).toArray();
    const hallMap = {};
    halls.forEach(h => {
      hallMap[h.name] = h._id;
    });

    // Get all rooms
    const rooms = await db.collection('rooms').find({}).toArray();
    console.log(`Found ${rooms.length} rooms\n`);

    let moved = 0;
    let maleCount = 0;
    let femaleCount = 0;

    for (const room of rooms) {
      const roomNumber = room.roomNumber || '';
      const roomNumMatch = roomNumber.match(/\d+/);
      const roomNum = roomNumMatch ? parseInt(roomNumMatch[0]) : 0;
      
      let newHallId = null;
      let hallName = '';
      
      // Assign even numbers to female halls, odd to male halls
      if (roomNumber.startsWith('A')) {
        if (roomNum % 2 === 0) {
          newHallId = hallMap['Queen Esther Hall'];
          hallName = 'Queen Esther Hall';
          femaleCount++;
        } else {
          newHallId = hallMap['Welch Hall'];
          hallName = 'Welch Hall';
          maleCount++;
        }
      } else if (roomNumber.startsWith('B')) {
        if (roomNum % 2 === 0) {
          newHallId = hallMap['Cleopatra Hall'];
          hallName = 'Cleopatra Hall';
          femaleCount++;
        } else {
          newHallId = hallMap['Winslow Hall'];
          hallName = 'Winslow Hall';
          maleCount++;
        }
      } else if (roomNumber.startsWith('C')) {
        if (roomNum % 2 === 0) {
          newHallId = hallMap['Beyoncé Hall'];
          hallName = 'Beyoncé Hall';
          femaleCount++;
        } else {
          newHallId = hallMap['Churchill Hall'];
          hallName = 'Churchill Hall';
          maleCount++;
        }
      } else if (roomNumber.startsWith('D')) {
        if (roomNum % 2 === 0) {
          newHallId = hallMap['Mae Jemison Hall'];
          hallName = 'Mae Jemison Hall';
          femaleCount++;
        } else {
          newHallId = hallMap['Nelson Hall'];
          hallName = 'Nelson Hall';
          maleCount++;
        }
      }
      
      if (newHallId && newHallId.toString() !== room.hall?.toString()) {
        await db.collection('rooms').updateOne(
          { _id: room._id },
          { $set: { hall: newHallId } }
        );
        moved++;
        console.log(`✅ Room ${room.roomNumber} (${roomNum}) -> ${hallName}`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Moved: ${moved} rooms`);
    console.log(`  - Male halls total: ${maleCount} rooms`);
    console.log(`  - Female halls total: ${femaleCount} rooms`);
    
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

assignFemaleHalls();
