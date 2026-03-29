const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');

dotenv.config();

// Import models
const User = require('./src/models/User');
const Room = require('./src/models/Room');
const Payment = require('./src/models/Payment');
const MaintenanceTicket = require('./src/models/MaintenanceTicket');

// Sample room images (Unsplash links)
const roomImages = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598928509925-5cde3f4109bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
];

const amenities = [
  'bed', 'mattress', 'wardrobe', 'desk', 'chair', 
  'fan', 'ac', 'wifi', 'attached_bathroom', 'tv',
  'mini_fridge', 'study_table', 'bookshelf', 'mirror'
];

const categories = ['electrical', 'plumbing', 'furniture', 'cleaning', 'security', 'internet', 'structural', 'pest_control', 'other'];
const priorities = ['low', 'medium', 'high', 'emergency'];
const statuses = ['pending', 'assigned', 'in_progress', 'resolved', 'closed'];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Room.deleteMany({});
    await Payment.deleteMany({});
    await MaintenanceTicket.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Get or create test users
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        matricNumber: 'TEST2024001',
        password: 'password123',
        phoneNumber: '+1234567890',
        gender: 'male',
        role: 'student'
      });
      console.log('👤 Created test user');
    }

    let adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        matricNumber: 'ADMIN2024001',
        password: 'admin123',
        phoneNumber: '+1234567891',
        gender: 'male',
        role: 'admin'
      });
      console.log('👤 Created admin user');
    }

    // Create 30 sample rooms
    console.log('🏠 Creating 30 sample rooms...');
    const rooms = [];
    const blocks = ['A', 'B', 'C', 'D', 'E'];
    const roomTypes = ['Standard', 'Deluxe', 'Executive', 'Suite', 'Studio'];
    const prices = [150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000];

    for (let i = 1; i <= 30; i++) {
      const block = blocks[Math.floor(Math.random() * blocks.length)];
      const floor = Math.floor(Math.random() * 4) + 1;
      const roomNumber = `${block}${floor}${String(i).padStart(2, '0')}`;
      const capacity = Math.floor(Math.random() * 4) + 1; // 1-4 occupants
      const price = prices[Math.floor(Math.random() * prices.length)];
      const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      const status = Math.random() > 0.3 ? 'available' : 'occupied'; // 70% available
      const genderRestriction = ['male', 'female', 'any'][Math.floor(Math.random() * 3)];
      
      // Random amenities (3-7 items)
      const roomAmenities = [];
      const numAmenities = Math.floor(Math.random() * 5) + 3;
      for (let j = 0; j < numAmenities; j++) {
        const amenity = amenities[Math.floor(Math.random() * amenities.length)];
        if (!roomAmenities.includes(amenity)) {
          roomAmenities.push(amenity);
        }
      }

      const room = await Room.create({
        roomNumber,
        blockName: `Block ${block}`,
        floorNumber: floor,
        capacity,
        price,
        genderRestriction,
        amenities: roomAmenities,
        status,
        availableSlots: status === 'available' ? capacity : Math.floor(Math.random() * capacity),
        images: [roomImages[Math.floor(Math.random() * roomImages.length)]],
        description: `Beautiful ${roomType} room with ${roomAmenities.join(', ')}. Perfect for students looking for comfort and convenience.`,
        occupants: status === 'occupied' ? [testUser._id] : []
      });

      rooms.push(room);
      
      // Allocate test user to one room
      if (i === 5 && status === 'occupied') {
        testUser.room = room._id;
        await testUser.save();
      }
    }
    console.log(`✅ Created ${rooms.length} rooms`);

    // Create sample payments
    console.log('💰 Creating sample payments...');
    const paymentStatuses = ['success', 'pending', 'failed'];
    const sessions = ['2023/2024', '2024/2025'];
    
    for (let i = 0; i < 20; i++) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const status = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const amount = room.price;
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Random date in last 60 days

      await Payment.create({
        student: testUser._id,
        room: room._id,
        amount,
        currency: 'NGN',
        paymentMethod: ['card', 'bank_transfer', 'paystack'][Math.floor(Math.random() * 3)],
        reference: `PAY-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`,
        status,
        paymentDate: status === 'success' ? date : null,
        sessionYear: sessions[Math.floor(Math.random() * sessions.length)],
        semester: ['first', 'second', 'both'][Math.floor(Math.random() * 3)],
        metadata: {
          roomNumber: room.roomNumber,
          studentName: testUser.name
        }
      });
    }
    console.log('✅ Created sample payments');

    // Create sample tickets
    console.log('🎫 Creating sample tickets...');
    const ticketTitles = [
      'Broken Air Conditioner',
      'Leaking Pipe',
      'Faulty Electrical Socket',
      'Broken Window',
      'No Internet Connection',
      'Cracked Wall',
      'Broken Chair',
      'Light Bulb Not Working',
      'Water Heater Issues',
      'Pest Control Needed',
      'Door Lock Broken',
      'Noisy Neighbors',
      'Cleanliness Issue'
    ];

    for (let i = 0; i < 25; i++) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days

      const ticket = await MaintenanceTicket.create({
        student: testUser._id,
        room: room._id,
        title: ticketTitles[Math.floor(Math.random() * ticketTitles.length)],
        description: faker.lorem.paragraph(),
        category,
        priority,
        status,
        createdAt: date,
        updatedAt: date,
        comments: status !== 'pending' ? [
          {
            user: adminUser._id,
            comment: faker.lorem.sentence(),
            createdAt: new Date(date.getTime() + 86400000) // Next day
          }
        ] : []
      });

      if (status === 'resolved') {
        ticket.resolvedAt = new Date(date.getTime() + 172800000); // 2 days later
        ticket.resolution = faker.lorem.paragraph();
        ticket.resolvedBy = adminUser._id;
        await ticket.save();
      }
    }
    console.log('✅ Created sample tickets');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: 2 (1 student, 1 admin)`);
    console.log(`- Rooms: ${rooms.length}`);
    console.log(`- Payments: 20`);
    console.log(`- Tickets: 25`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('Student - Email: test@example.com | Password: password123');
    console.log('Admin   - Email: admin@example.com | Password: admin123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

seedDatabase();
