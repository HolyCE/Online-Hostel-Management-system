const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB\n');
    
    // Delete pending payments
    const paymentResult = await db.collection('payments').deleteMany({ status: 'pending' });
    console.log(`✅ Deleted ${paymentResult.deletedCount} pending payments`);
    
    // Remove room from John Doe
    const userResult = await db.collection('users').updateMany(
      { email: 'john.doe@student.com' },
      { $unset: { room: "" } }
    );
    console.log(`✅ Removed room from student: ${userResult.modifiedCount}`);
    
    // Reset all rooms to available with no occupants
    const roomResult = await db.collection('rooms').updateMany(
      {},
      { $set: { status: 'available', occupants: [] } }
    );
    console.log(`✅ Reset ${roomResult.modifiedCount} rooms to available`);
    
    // Also reset available slots
    const rooms = await db.collection('rooms').find({}).toArray();
    for (const room of rooms) {
      await db.collection('rooms').updateOne(
        { _id: room._id },
        { $set: { availableSlots: room.capacity } }
      );
    }
    console.log(`✅ Reset available slots for ${rooms.length} rooms`);
    
    await mongoose.disconnect();
    console.log('\n✅ Cleanup complete! Ready for testing.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

cleanup();
