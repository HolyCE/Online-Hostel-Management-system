const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

async function testGmail() {
  console.log('📧 Testing Gmail configuration...');
  console.log('   Email:', process.env.EMAIL_USER);
  console.log('   Host:', process.env.EMAIL_HOST);
  console.log('   Port:', process.env.EMAIL_PORT);
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: '✅ HostelHub Email Test - Successful!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center;">
            <div style="background: #000; width: 50px; height: 50px; border-radius: 10px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">🏠</span>
            </div>
            <h1 style="color: #000; margin-top: 15px;">Email Working!</h1>
            <p style="color: #666;">Your Hostel Management System can now send emails.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            Sent from HostelHub - Student Accommodation Management System
          </p>
        </div>
      `
    });
    
    console.log('\n✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Check your inbox at:', process.env.EMAIL_USER);
    console.log('\n👉 Please check your Gmail inbox (and spam folder)');
    
  } catch (error) {
    console.error('\n❌ Failed to send email:', error.message);
    if (error.message.includes('Invalid login')) {
      console.log('\n⚠️  The app password may not be correct.');
      console.log('   Make sure you copied the 16-character password exactly.');
      console.log('   Current password (without spaces):', process.env.EMAIL_PASS);
    }
  }
}

testGmail();
