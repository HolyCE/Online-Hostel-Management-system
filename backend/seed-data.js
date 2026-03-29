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
const AuditLog = require('./src/models/AuditLog');
const Notification = require('./src/models/Notification');
const WaitingList = require('./src/models/WaitingList');

// Nigerian phone number helper
function generateNigerianPhoneNumber() {
  const prefixes = ['0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906', '0703', '0706'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return prefix + number;
}

// Valid amenities from Room model
const validAmenities = [
  'bed', 'mattress', 'wardrobe', 'desk', 'chair', 
  'fan', 'ac', 'wifi', 'attached_bathroom'
];

// Sample room images
const roomImages = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Payment.deleteMany({});
    await MaintenanceTicket.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});
    await WaitingList.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create users
    console.log('👥 Creating users...');
    
    const users = [];
    
    // Admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@ohms.com',
      matricNumber: 'ADMIN001',
      password: 'Admin123!',
      role: 'admin',
      phoneNumber: '08012345678',
      gender: 'male',
      isActive: true
    });
    users.push(adminUser);
    console.log(`  Created admin: ${adminUser.email}`);
    
    // Staff user
    const staffUser = await User.create({
      name: 'Staff Member',
      email: 'staff@ohms.com',
      matricNumber: 'STAFF001',
      password: 'Staff123!',
      role: 'staff',
      phoneNumber: '08012345679',
      gender: 'female',
      isActive: true
    });
    users.push(staffUser);
    console.log(`  Created staff: ${staffUser.email}`);
    
    // Create 10 students
    const studentData = [
      { name: 'John Doe', email: 'john.doe@student.com', matric: 'STU0001', gender: 'male', course: 'Computer Science', year: 3 },
      { name: 'Jane Smith', email: 'jane.smith@student.com', matric: 'STU0002', gender: 'female', course: 'Engineering', year: 2 },
      { name: 'Michael Brown', email: 'michael.brown@student.com', matric: 'STU0003', gender: 'male', course: 'Business', year: 4 },
      { name: 'Sarah Johnson', email: 'sarah.johnson@student.com', matric: 'STU0004', gender: 'female', course: 'Medicine', year: 2 },
      { name: 'David Wilson', email: 'david.wilson@student.com', matric: 'STU0005', gender: 'male', course: 'Law', year: 3 },
      { name: 'Emma Davis', email: 'emma.davis@student.com', matric: 'STU0006', gender: 'female', course: 'Computer Science', year: 1 },
      { name: 'James Martinez', email: 'james.martinez@student.com', matric: 'STU0007', gender: 'male', course: 'Engineering', year: 3 },
      { name: 'Lisa Anderson', email: 'lisa.anderson@student.com', matric: 'STU0008', gender: 'female', course: 'Business', year: 2 },
      { name: 'Robert Taylor', email: 'robert.taylor@student.com', matric: 'STU0009', gender: 'male', course: 'Medicine', year: 4 },
      { name: 'Maria Garcia', email: 'maria.garcia@student.com', matric: 'STU0010', gender: 'female', course: 'Computer Science', year: 2 }
    ];
    
    const students = [];
    for (const data of studentData) {
      const student = await User.create({
        name: data.name,
        email: data.email,
        matricNumber: data.matric,
        password: 'Student123!',
        role: 'student',
        phoneNumber: generateNigerianPhoneNumber(),
        gender: data.gender,
        isActive: true
      });
      students.push(student);
      users.push(student);
      console.log(`  Created student: ${student.email}`);
    }
    
    console.log(`✅ Created ${users.length} users`);

    // Create rooms
    console.log('🏠 Creating rooms...');
    const rooms = [];
    const blocks = ['A', 'B', 'C', 'D'];
    const roomTypes = ['Standard', 'Deluxe', 'Executive', 'Suite'];
    const prices = {
      'Standard': [120000, 150000],
      'Deluxe': [180000, 200000],
      'Executive': [250000, 300000],
      'Suite': [350000, 400000]
    };
    
    let roomCounter = 1;
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      const block = blocks[blockIndex];
      const blockName = `Block ${block}`;
      const genderRestriction = block === 'A' || block === 'C' ? 'male' : (block === 'B' || block === 'D' ? 'female' : 'any');
      
      for (let floor = 1; floor <= 3; floor++) {
        for (let roomNum = 1; roomNum <= 4; roomNum++) {
          const roomNumber = `${block}${floor}${String(roomNum).padStart(2, '0')}`;
          const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
          const priceRange = prices[roomType];
          const price = Math.floor(Math.random() * (priceRange[1] - priceRange[0] + 1) + priceRange[0]);
          const capacity = roomType === 'Suite' ? 2 : (roomType === 'Standard' ? 4 : 3);
          
          // Random amenities (3-6 items from valid amenities)
          const shuffled = [...validAmenities];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          const numAmenities = Math.floor(Math.random() * 4) + 3; // 3-6 amenities
          const roomAmenities = shuffled.slice(0, numAmenities);
          
          // Create room first without occupants
          const room = await Room.create({
            roomNumber,
            blockName,
            floorNumber: floor,
            capacity,
            price,
            genderRestriction,
            amenities: roomAmenities,
            status: 'available', // Will be updated after adding occupants
            occupants: [],
            images: [roomImages[Math.floor(Math.random() * roomImages.length)]],
            description: `${roomType} room in ${blockName}, floor ${floor}. ${roomAmenities.length} amenities included.`
          });
          
          // Assign occupants for first 15 rooms
          let status = 'available';
          let occupants = [];
          
          if (roomCounter <= 15) {
            // Assign 1-3 students to this room
            const numOccupants = Math.min(Math.floor(Math.random() * capacity) + 1, capacity);
            const eligibleStudents = students.filter(s => {
              if (genderRestriction === 'male') return s.gender === 'male';
              if (genderRestriction === 'female') return s.gender === 'female';
              return true;
            });
            
            for (let i = 0; i < numOccupants && i < eligibleStudents.length; i++) {
              const student = eligibleStudents[i % eligibleStudents.length];
              if (!occupants.includes(student._id)) {
                occupants.push(student._id);
                // Update student's room
                await User.findByIdAndUpdate(student._id, { room: room._id });
              }
            }
            status = occupants.length === capacity ? 'full' : 'occupied';
            
            // Update room with occupants and status
            room.occupants = occupants;
            room.status = status;
            await room.save();
          }
          
          rooms.push(room);
          roomCounter++;
          
          if (rooms.length <= 10) {
            console.log(`  Created room: ${roomNumber} (${roomType}, ${status})`);
          }
        }
      }
    }
    console.log(`✅ Created ${rooms.length} rooms`);

    // Create payments - avoid duplicates by tracking combinations
    console.log('💰 Creating payments...');
    const paymentStatuses = ['success', 'pending', 'failed'];
    const sessions = ['2023/2024', '2024/2025'];
    const semesters = ['first', 'second'];
    const paidForOptions = ['accommodation', 'caution_fee'];
    
    const usedCombinations = new Set();
    
    for (let i = 0; i < 30; i++) {
      let attempts = 0;
      let created = false;
      
      while (!created && attempts < 10) {
        const student = students[Math.floor(Math.random() * students.length)];
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const sessionYear = sessions[Math.floor(Math.random() * sessions.length)];
        const semester = semesters[Math.floor(Math.random() * semesters.length)];
        const paidFor = paidForOptions[Math.floor(Math.random() * paidForOptions.length)];
        const combinationKey = `${student._id}-${sessionYear}-${semester}-${paidFor}`;
        
        // Skip if this combination already exists
        if (!usedCombinations.has(combinationKey)) {
          const status = paymentStatuses[Math.floor(Math.random() * 3)];
          const amount = room.price;
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 90));
          
          try {
            await Payment.create({
              student: student._id,
              room: room._id,
              amount,
              currency: 'NGN',
              paymentMethod: ['card', 'bank_transfer', 'paystack'][Math.floor(Math.random() * 3)],
              reference: `PAY-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`,
              status,
              paymentDate: status === 'success' ? date : null,
              sessionYear,
              semester,
              paidFor,
              metadata: {
                roomNumber: room.roomNumber,
                studentName: student.name
              }
            });
            usedCombinations.add(combinationKey);
            created = true;
          } catch (err) {
            // If duplicate error, try another combination
            if (err.message.includes('already paid')) {
              attempts++;
              continue;
            }
            throw err;
          }
        } else {
          attempts++;
        }
      }
    }
    console.log('✅ Created payments');
    
    // Create maintenance tickets
    console.log('🎫 Creating maintenance tickets...');
    const ticketTitles = [
      'Broken Air Conditioner', 'Leaking Pipe', 'Faulty Electrical Socket',
      'Broken Window', 'No Internet Connection', 'Broken Chair',
      'Light Bulb Not Working', 'Water Heater Issues', 'Door Lock Broken'
    ];
    const categories = ['electrical', 'plumbing', 'furniture', 'cleaning', 'internet'];
    const priorities = ['low', 'medium', 'high', 'emergency'];
    const ticketStatuses = ['pending', 'assigned', 'in_progress', 'resolved', 'closed'];
    
    for (let i = 0; i < 40; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const status = ticketStatuses[Math.floor(Math.random() * ticketStatuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 60));
      
      const ticketData = {
        student: student._id,
        room: room._id,
        title: ticketTitles[Math.floor(Math.random() * ticketTitles.length)],
        description: faker.lorem.paragraph(),
        category,
        priority,
        status,
        createdAt: date,
        updatedAt: date
      };
      
      if (status !== 'pending' && status !== 'closed') {
        ticketData.assignedTo = staffUser._id;
        ticketData.assignedAt = new Date(date.getTime() + 86400000);
      }
      
      if (status === 'resolved') {
        ticketData.resolvedAt = new Date(date.getTime() + 172800000);
        ticketData.resolution = faker.lorem.sentence();
        ticketData.resolvedBy = staffUser._id;
      }
      
      if (status !== 'pending') {
        ticketData.comments = [{
          user: staffUser._id,
          comment: faker.lorem.sentence(),
          createdAt: new Date(date.getTime() + 86400000)
        }];
      }
      
      await MaintenanceTicket.create(ticketData);
    }
    console.log('✅ Created 40 maintenance tickets');
    
    // Create notifications
    console.log('🔔 Creating notifications...');
    const notificationTypes = ['email', 'in_app', 'push', 'system'];
    const channels = ['payment', 'room', 'ticket', 'auth', 'system', 'reminder'];
    
    for (let i = 0; i < 50; i++) {
      const user = students[Math.floor(Math.random() * students.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      await Notification.create({
        recipient: user._id,
        type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
        channel: channels[Math.floor(Math.random() * channels.length)],
        subject: ['Payment Reminder', 'Room Update', 'Ticket Status', 'Announcement'][Math.floor(Math.random() * 4)],
        content: faker.lorem.sentence(),
        status: ['sent', 'delivered', 'read'][Math.floor(Math.random() * 3)],
        sentAt: date,
        deliveredAt: new Date(date.getTime() + 3600000),
        readAt: Math.random() > 0.5 ? new Date(date.getTime() + 7200000) : null,
        scheduledFor: date
      });
    }
    console.log('✅ Created 50 notifications');
    
    // Create audit logs
    console.log('📝 Creating audit logs...');
    const actions = ['LOGIN', 'LOGOUT', 'CREATE_ROOM', 'UPDATE_ROOM', 'CREATE_USER', 'CREATE_PAYMENT', 'CREATE_TICKET', 'UPDATE_TICKET'];
    
    for (let i = 0; i < 100; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      await AuditLog.create({
        user: user._id,
        action: action,
        details: `${action} performed by ${user.name}`,
        resource: action.toLowerCase().split('_')[1] || 'system',
        ip: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        status: Math.random() > 0.1 ? 'success' : 'failure',
        timestamp: date
      });
    }
    console.log('✅ Created 100 audit logs');
    
    // Create waiting list entries
    console.log('⏰ Creating waiting list entries...');
    const roomTypesList = ['single', 'double', 'triple', 'quad', 'any'];
    
    for (let i = 0; i < 15; i++) {
      const student = students[i % students.length];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 45));
      
      try {
        await WaitingList.create({
          student: student._id,
          preferredRoomType: roomTypesList[Math.floor(Math.random() * roomTypesList.length)],
          preferredGender: ['male', 'female', 'any'][Math.floor(Math.random() * 3)],
          maxPrice: [150000, 200000, 250000, 300000][Math.floor(Math.random() * 4)],
          requestedDate: date,
          status: ['waiting', 'allocated', 'cancelled'][Math.floor(Math.random() * 3)],
          notes: faker.lorem.sentence()
        });
      } catch (err) {
        // Skip if student already in waiting list
        if (!err.message.includes('duplicate')) {
          console.log(`  Skipped duplicate waiting list entry for ${student.email}`);
        }
      }
    }
    console.log('✅ Created waiting list entries');
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users.length} (1 admin, 1 staff, 10 students)`);
    console.log(`- Rooms: ${rooms.length}`);
    console.log(`- Payments: 30`);
    console.log(`- Maintenance Tickets: 40`);
    console.log(`- Notifications: 50`);
    console.log(`- Audit Logs: 100`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('Admin  - Email: admin@ohms.com | Password: Admin123!');
    console.log('Staff  - Email: staff@ohms.com | Password: Staff123!');
    console.log('\n📝 Student Credentials (Password for all: Student123!):');
    students.forEach(student => {
      console.log(`  ${student.name} - ${student.email}`);
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
    if (error.errors) {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

seedDatabase();
