const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Hall = require('./src/models/Hall');

// Updated hostel building images
const hallImages = {
  'Welch Hall': [
    'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'Winslow Hall': [
    'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'Churchill Hall': [
    'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'Nelson Hall': [
    'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'Queen Esther Hall': [
    'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'Cleopatra Hall': [
    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'Beyoncé Hall': [
    'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'Mae Jemison Hall': [
    'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'
  ]
};

async function updateHallImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const halls = await Hall.find();
    console.log(`Found ${halls.length} halls\n`);

    let updated = 0;
    
    for (const hall of halls) {
      const images = hallImages[hall.name];
      if (images) {
        await Hall.findByIdAndUpdate(hall._id, { images });
        updated++;
        console.log(`✅ Updated ${hall.name} with ${images.length} hostel building images`);
      } else {
        console.log(`⚠️ No images found for ${hall.name}`);
      }
    }
    
    console.log(`\n📊 Updated ${updated} halls with hostel building images`);
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

updateHallImages();
