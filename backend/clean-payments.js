const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function cleanPayments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB\n');

    // Find the student
    const student = await db.collection('users').findOne({ email: 'john.doe@student.com' });
    if (student) {
      console.log('Student found:', student.name);
      
      // Delete all payments for this student
      const paymentResult = await db.collection('payments').deleteMany({ student: student._id });
      console.log(`✅ Deleted ${paymentResult.deletedCount} payments`);
      
      // Remove room from student
      await db.collection('users').updateOne(
        { _id: student._id },
        { $unset: { room: "" } }
      );
      console.log('✅ Removed room assignment');
    }
    
    // Reset all rooms to available
    const roomResult = await db.collection('rooms').updateMany(
      {},
      { $set: { status: 'available', occupants: [] } }
    );
    console.log(`✅ Reset ${roomResult.modifiedCount} rooms to available`);
    
    await mongoose.disconnect();
    console.log('\n✅ Cleanup complete! Ready for testing.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

cleanPayments();
