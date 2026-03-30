const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Room = require('./src/models/Room');

// Room interior images (dorm/hostel room photos)
const roomImages = [
  'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1648771/pexels-photo-1648771.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800'
];

async function updateRoomImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const rooms = await Room.find();
    console.log(`Found ${rooms.length} rooms\n`);

    let updated = 0;
    
    for (const room of rooms) {
      // Assign random image from array
      const randomImage = roomImages[Math.floor(Math.random() * roomImages.length)];
      await Room.findByIdAndUpdate(room._id, { images: [randomImage] });
      updated++;
      console.log(`✅ Updated Room ${room.roomNumber} with hostel room image`);
    }
    
    console.log(`\n📊 Updated ${updated} rooms with hostel room images`);
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

updateRoomImages();
