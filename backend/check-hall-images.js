const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB\n');
    
    const halls = await db.collection('halls').find({}).toArray();
    console.log('Halls in database:', halls.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    halls.forEach(hall => {
      console.log(`🏠 ${hall.name}`);
      console.log(`   Images: ${hall.images ? hall.images.length : 0}`);
      if (hall.images && hall.images.length > 0) {
        console.log(`   First image: ${hall.images[0]}`);
      } else {
        console.log(`   ❌ NO IMAGES!`);
      }
      console.log('');
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

check();
