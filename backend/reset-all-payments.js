const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function resetAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB\n');

    // Delete ALL payments (not just pending)
    const paymentResult = await db.collection('payments').deleteMany({});
    console.log(`✅ Deleted ${paymentResult.deletedCount} payments (all)`);
    
    // Remove room from ALL students
    const userResult = await db.collection('users').updateMany(
      { role: 'student' },
      { $unset: { room: "" } }
    );
    console.log(`✅ Removed rooms from ${userResult.modifiedCount} students`);
    
    // Reset ALL rooms to available with no occupants
    const roomResult = await db.collection('rooms').updateMany(
      {},
      { $set: { status: 'available', occupants: [] } }
    );
    console.log(`✅ Reset ${roomResult.modifiedCount} rooms to available`);
    
    await mongoose.disconnect();
    console.log('\n✅ Complete reset done! All students now have no rooms, all payments cleared.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

resetAll();
