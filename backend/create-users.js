const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Check for Admin
    let admin = await usersCollection.findOne({ email: 'admin@hostel.com' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await usersCollection.insertOne({
        name: 'Admin User',
        email: 'admin@hostel.com',
        matricNumber: 'ADMIN001',
        password: hashedPassword,
        role: 'admin',
        phoneNumber: '+2348000000001',
        gender: 'male',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Check for Staff
    let staff = await usersCollection.findOne({ email: 'staff@hostel.com' });
    if (!staff) {
      const hashedPassword = await bcrypt.hash('staff123', 10);
      await usersCollection.insertOne({
        name: 'Staff User',
        email: 'staff@hostel.com',
        matricNumber: 'STAFF001',
        password: hashedPassword,
        role: 'staff',
        phoneNumber: '+2348000000002',
        gender: 'male',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Staff user created');
    } else {
      console.log('✅ Staff user already exists');
    }
    
    // Check for Test Student
    let student = await usersCollection.findOne({ email: 'test@student.com' });
    if (!student) {
      const hashedPassword = await bcrypt.hash('student123', 10);
      await usersCollection.insertOne({
        name: 'Test Student',
        email: 'test@student.com',
        matricNumber: 'STU2024001',
        password: hashedPassword,
        role: 'student',
        phoneNumber: '+2348012345678',
        gender: 'male',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Test student created');
    } else {
      console.log('✅ Test student already exists');
    }
    
    // List all users
    console.log('\n📊 All users in database:\n');
    const allUsers = await usersCollection.find({}).toArray();
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createUsers();
