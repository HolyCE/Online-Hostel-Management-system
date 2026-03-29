const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hall = require('./src/models/Hall');
const Room = require('./src/models/Room');

dotenv.config();

const maleHalls = [
  {
    name: "Welch Hall",
    gender: "male",
    code: "WH",
    description: "A historic hall known for academic excellence and strong community spirit. Features modern amenities and comfortable living spaces.",
    amenities: ["cafeteria", "gym", "study_room", "common_room", "wifi", "security"],
    totalCapacity: 200,
    address: "North Campus, Block A",
    contactPhone: "08012345678",
    wardenName: "Dr. Robert Johnson"
  },
  {
    name: "Winslow Hall",
    gender: "male",
    code: "WLH",
    description: "Named after a distinguished alumnus, this hall offers premium accommodation with state-of-the-art facilities.",
    amenities: ["cafeteria", "study_room", "common_room", "wifi", "security", "sports_facility"],
    totalCapacity: 180,
    address: "North Campus, Block B",
    contactPhone: "08012345679",
    wardenName: "Prof. Michael Anderson"
  },
  {
    name: "Churchill Hall",
    gender: "male",
    code: "CH",
    description: "A vibrant community with excellent recreational facilities and a supportive environment.",
    amenities: ["cafeteria", "gym", "common_room", "wifi", "security", "laundry"],
    totalCapacity: 220,
    address: "East Campus, Block C",
    contactPhone: "08012345680",
    wardenName: "Dr. William Bennett"
  },
  {
    name: "Nelson Hall",
    gender: "male",
    code: "NH",
    description: "Modern hall with spacious rooms and excellent study areas. Perfect for focused students.",
    amenities: ["study_room", "common_room", "wifi", "security", "gym", "parking"],
    totalCapacity: 160,
    address: "East Campus, Block D",
    contactPhone: "08012345681",
    wardenName: "Prof. James Wilson"
  }
];

const femaleHalls = [
  {
    name: "Queen Esther Hall",
    gender: "female",
    code: "QEH",
    description: "Elegant and secure hall designed for comfort and academic success. Features beautiful gardens and modern facilities.",
    amenities: ["cafeteria", "study_room", "common_room", "wifi", "security", "laundry"],
    totalCapacity: 200,
    address: "South Campus, Block A",
    contactPhone: "08012345682",
    wardenName: "Dr. Sarah Williams"
  },
  {
    name: "Cleopatra Hall",
    gender: "female",
    code: "CLH",
    description: "Named after the legendary queen, this hall offers luxurious living spaces and premium amenities.",
    amenities: ["cafeteria", "gym", "study_room", "common_room", "wifi", "security", "sports_facility"],
    totalCapacity: 190,
    address: "South Campus, Block B",
    contactPhone: "08012345683",
    wardenName: "Prof. Elizabeth Taylor"
  },
  {
    name: "Beyoncé Hall",
    gender: "female",
    code: "BH",
    description: "Inspired by excellence, this hall empowers students with a supportive and vibrant community.",
    amenities: ["cafeteria", "study_room", "common_room", "wifi", "security", "gym", "laundry"],
    totalCapacity: 210,
    address: "West Campus, Block C",
    contactPhone: "08012345684",
    wardenName: "Dr. Michelle Obama"
  },
  {
    name: "Mae Jemison Hall",
    gender: "female",
    code: "MJH",
    description: "Named after the first African American woman in space, this hall encourages innovation and excellence.",
    amenities: ["study_room", "common_room", "wifi", "security", "cafeteria", "parking"],
    totalCapacity: 170,
    address: "West Campus, Block D",
    contactPhone: "08012345685",
    wardenName: "Prof. Mae C. Jemison"
  }
];

async function seedHalls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing halls
    await Hall.deleteMany({});
    console.log('🧹 Cleared existing halls');

    // Create all halls
    const allHalls = [...maleHalls, ...femaleHalls];
    const createdHalls = await Hall.insertMany(allHalls);
    console.log(`✅ Created ${createdHalls.length} halls`);

    // Update rooms to reference halls
    const rooms = await Room.find();
    console.log(`Found ${rooms.length} rooms to update`);

    for (const room of rooms) {
      let hallToAssign = null;
      
      // Assign to appropriate hall based on block name and gender
      if (room.blockName === 'Block A' || room.blockName === 'BLOCK A') {
        hallToAssign = createdHalls.find(h => h.name === 'Welch Hall' || h.name === 'Queen Esther Hall');
      } else if (room.blockName === 'Block B' || room.blockName === 'BLOCK B') {
        hallToAssign = createdHalls.find(h => h.name === 'Winslow Hall' || h.name === 'Cleopatra Hall');
      } else if (room.blockName === 'Block C' || room.blockName === 'BLOCK C') {
        hallToAssign = createdHalls.find(h => h.name === 'Churchill Hall' || h.name === 'Beyoncé Hall');
      } else if (room.blockName === 'Block D' || room.blockName === 'BLOCK D') {
        hallToAssign = createdHalls.find(h => h.name === 'Nelson Hall' || h.name === 'Mae Jemison Hall');
      }

      if (hallToAssign) {
        // Update room with hall reference and calculate prices
        const sessionPrice = room.basePrice || room.price || 600000;
        const semesterPrice = Math.round(sessionPrice / 2);
        const monthlyPrice = Math.round(semesterPrice / 3);
        const weeklyPrice = Math.round(monthlyPrice / 4);

        await Room.findByIdAndUpdate(room._id, {
          hall: hallToAssign._id,
          basePrice: sessionPrice,
          prices: {
            weekly: weeklyPrice,
            monthly: monthlyPrice,
            semester: semesterPrice,
            session: sessionPrice
          }
        });
        console.log(`  Updated room ${room.roomNumber} -> ${hallToAssign.name}`);
      }
    }

    console.log('\n🎉 Halls seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Male Halls: ${maleHalls.length}`);
    console.log(`- Female Halls: ${femaleHalls.length}`);
    console.log(`- Total Halls: ${createdHalls.length}`);
    console.log(`- Rooms Updated: ${rooms.length}`);

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

seedHalls();
