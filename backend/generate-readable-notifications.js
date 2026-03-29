const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./src/models/User');
const Notification = require('./src/models/Notification');

async function generateReadableNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear old notifications
    await Notification.deleteMany({});
    console.log('🧹 Cleared old notifications');

    // Get all students
    const students = await User.find({ role: 'student' });
    console.log(`Found ${students.length} students\n`);

    const notificationTemplates = [
      { 
        title: '🏠 Room Allocated', 
        message: 'You have been allocated Room A101 in Welch Hall. Welcome to your new space!',
        channel: 'room',
        type: 'success'
      },
      { 
        title: '💰 Payment Received', 
        message: 'Your payment of ₦150,000 has been received and confirmed.',
        channel: 'payment',
        type: 'success'
      },
      { 
        title: '🔧 Maintenance Request', 
        message: 'Your maintenance request for broken AC has been assigned to a technician.',
        channel: 'ticket',
        type: 'info'
      },
      { 
        title: '⚠️ Payment Reminder', 
        message: 'Your accommodation fee is due in 3 days. Please make payment to avoid late fees.',
        channel: 'payment',
        type: 'warning'
      },
      { 
        title: '✅ Ticket Resolved', 
        message: 'Your complaint ticket has been resolved. Please check and confirm.',
        channel: 'ticket',
        type: 'success'
      },
      { 
        title: '📢 Announcement', 
        message: 'Hostel will be closed for maintenance on December 25th. Plan accordingly.',
        channel: 'system',
        type: 'info'
      },
      { 
        title: '🔔 Room Inspection', 
        message: 'Room inspection scheduled for tomorrow at 10:00 AM. Please ensure your room is tidy.',
        channel: 'room',
        type: 'warning'
      },
      { 
        title: '🎉 Welcome to HostelHub', 
        message: 'Welcome to the community! Check out available rooms and make yourself at home.',
        channel: 'system',
        type: 'success'
      }
    ];

    let createdCount = 0;

    for (const student of students) {
      // Create 3-5 notifications per student
      const numNotifications = Math.floor(Math.random() * 3) + 3;
      const shuffled = [...notificationTemplates];
      
      for (let i = 0; i < numNotifications && i < shuffled.length; i++) {
        const template = shuffled[i];
        const isRead = Math.random() > 0.5; // 50% read, 50% unread
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 14));
        
        await Notification.create({
          recipient: student._id,
          type: 'in_app',
          channel: template.channel,
          subject: template.title,
          content: template.message,
          status: isRead ? 'read' : 'sent',
          readAt: isRead ? new Date(createdAt.getTime() + 3600000) : null,
          sentAt: createdAt,
          scheduledFor: createdAt,
          priority: template.type === 'warning' ? 'high' : 'medium',
          metadata: {
            type: template.type
          }
        });
        createdCount++;
      }
    }

    console.log(`✅ Created ${createdCount} notifications for ${students.length} students`);
    
    // Verify counts
    const total = await Notification.countDocuments();
    console.log(`\n📊 Total notifications in database: ${total}`);
    
    // Show sample
    const sample = await Notification.findOne().populate('recipient', 'name email');
    console.log('\n📋 Sample notification:');
    console.log(`  To: ${sample?.recipient?.name}`);
    console.log(`  Subject: ${sample?.subject}`);
    console.log(`  Content: ${sample?.content}`);
    console.log(`  Status: ${sample?.status}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

generateReadableNotifications();
