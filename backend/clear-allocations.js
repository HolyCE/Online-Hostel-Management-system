const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User');
const Room = require('./src/models/Room');

async function clearAllocations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Show current allocations before clearing
    console.log('\n=== Current Allocations ===');
    
    const usersWithRooms = await User.find({ room: { $ne: null } }).select('name email room');
    console.log(`Users with rooms: ${usersWithRooms.length}`);
    usersWithRooms.forEach(u => {
      console.log(`  - ${u.name} (${u.email}) -> Room: ${u.room}`);
    });

    const roomsWithOccupants = await Room.find({ occupants: { $ne: [] } }).select('roomNumber blockName occupants');
    console.log(`\nRooms with occupants: ${roomsWithOccupants.length}`);
    roomsWithOccupants.forEach(r => {
      console.log(`  - ${r.roomNumber} (${r.blockName}) -> Occupants: ${r.occupants.length}`);
    });

    // Clear allocations
    console.log('\n=== Clearing Allocations ===');

    // Remove room reference from all users
    const userResult = await User.updateMany(
      { room: { $ne: null } },
      { $unset: { room: "" } }
    );
    console.log(`✓ Removed room references from ${userResult.modifiedCount} users`);

    // Clear occupants array from all rooms
    const roomResult = await Room.updateMany(
      { occupants: { $ne: [] } },
      { $set: { occupants: [] } }
    );
    console.log(`✓ Cleared occupants from ${roomResult.modifiedCount} rooms`);

    // Reset all room statuses to available
    const statusResult = await Room.updateMany(
      {},
      { $set: { status: 'available' } }
    );
    console.log(`✓ Reset ${statusResult.modifiedCount} rooms to available`);

    // Verify clear
    console.log('\n=== After Clearing ===');
    const remainingUsers = await User.countDocuments({ room: { $ne: null } });
    const remainingRooms = await Room.countDocuments({ occupants: { $ne: [] } });
    const availableRooms = await Room.countDocuments({ status: 'available' });
    
    console.log(`Users with rooms: ${remainingUsers}`);
    console.log(`Rooms with occupants: ${remainingRooms}`);
    console.log(`Available rooms: ${availableRooms}`);

    console.log('\n✅ All room allocations cleared successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

clearAllocations();
