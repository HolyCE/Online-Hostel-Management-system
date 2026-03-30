const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Room = require('./src/models/Room');

// Room interior images
const roomImages = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598928509925-5cde3f4109bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
];

async function updateRoomImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const rooms = await Room.find();
    console.log(`Found ${rooms.length} rooms\n`);

    let updated = 0;
    
    for (const room of rooms) {
      const randomImage = roomImages[Math.floor(Math.random() * roomImages.length)];
      
      if (!room.images || room.images.length === 0) {
        await Room.findByIdAndUpdate(room._id, { images: [randomImage] });
        updated++;
        console.log(`✅ Added image to Room ${room.roomNumber}`);
      } else {
        console.log(`⚠️ Room ${room.roomNumber} already has images`);
      }
    }
    
    console.log(`\n📊 Updated ${updated} rooms with images`);
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

updateRoomImages();
