const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Hall = require('./src/models/Hall');

// Hall images (college/uni building images)
const hallImages = {
  'Welch Hall': [
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Winslow Hall': [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Churchill Hall': [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Nelson Hall': [
    'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Queen Esther Hall': [
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Cleopatra Hall': [
    'https://images.unsplash.com/photo-1532522750741-628fde798c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Beyoncé Hall': [
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Mae Jemison Hall': [
    'https://images.unsplash.com/photo-1532522750741-628fde798c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
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
      if (images && (!hall.images || hall.images.length === 0)) {
        await Hall.findByIdAndUpdate(hall._id, { images });
        updated++;
        console.log(`✅ Added ${images.length} images to ${hall.name}`);
      } else if (hall.images && hall.images.length > 0) {
        console.log(`⚠️ ${hall.name} already has images`);
      } else {
        console.log(`⚠️ No images found for ${hall.name}`);
      }
    }
    
    console.log(`\n📊 Updated ${updated} halls with images`);
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

updateHallImages();
