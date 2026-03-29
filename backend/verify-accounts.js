const mongoose = require('mongoose');
require('dotenv').config();

async function verifyAccounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log('\n🔐 TEST ACCOUNTS:\n');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│ ROLE    │ EMAIL                    │ PASSWORD     │ STATUS │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    
    const roleMap = {
      admin: { email: 'admin@hostel.com', password: 'admin123' },
      staff: { email: 'staff@hostel.com', password: 'staff123' },
      student: { email: 'test@student.com', password: 'student123' }
    };
    
    for (const [role, info] of Object.entries(roleMap)) {
      const user = users.find(u => u.role === role);
      if (user) {
        const email = user.email.padEnd(23);
        console.log(`│ ${role.padEnd(7)} │ ${email} │ ${info.password.padEnd(11)} │ Active  │`);
      }
    }
    
    console.log('└─────────────────────────────────────────────────────────────┘\n');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verifyAccounts();
