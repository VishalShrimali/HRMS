import nodemailer from "nodemailer";
import dotenv from "dotenv";
import twilio from "twilio";
import { Employee } from "../models/employee.models.js";
import moment from "moment-timezone";

// Load environment variables
dotenv.config();

// Debug environment variables
console.log("Environment Variables Check:");
console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "✓ exists" : "✗ missing");
console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "✓ exists" : "✗ missing");
console.log("TWILIO_NUMBER:", process.env.TWILIO_NUMBER ? "✓ exists" : "✗ missing");
console.log("SMTP_USER:", process.env.SMTP_USER ? "✓ exists" : "✗ missing");
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "✓ exists" : "✗ missing");

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
// Create a test file with just Twilio functionality



const testTwilio = async () => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = new twilio.Twilio(accountSid, authToken);
    
    console.log("Client initialized successfully");
    
    // Test a simple SMS instead of WhatsApp first
    const message = await client.messages.create({
      body: 'Test message',
      from: process.env.TWILIO_NUMBER,
      to: '+919876543210' // Your test number
    });
    
    console.log("Message sent:", message.sid);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

testTwilio();

// Initialize Twilio Client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Send email notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlcontent - HTML content of the email
 */
const sendEmail = async (to, subject, htmlcontent) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: to, // Use the passed 'to' parameter instead of hardcoded email
    subject,
    html: htmlcontent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.response}`);
    return { success: true, message: `Email sent to ${to}`, info };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Format phone number to international format
 * @param {string} number - Phone number to format
 * @returns {string} Formatted phone number
 */
const formatPhoneNumber = (number) => {
  // Remove any non-digit characters
  const cleaned = number.replace(/\D/g, '');
  
  // Check if it already has country code
  if (number.startsWith("+")) {
    return number;
  }
  
  // Otherwise add Indian country code (+91)
  return `+91${cleaned}`;
};

/**
 * Send WhatsApp message
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - Message content
 */
const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    // Format the phone number
    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    console.log(`Attempting to send WhatsApp message to: ${formattedNumber}`);
    
    // Send the message
    const response = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_NUMBER}`,
      to: `whatsapp:${formattedNumber}`,
      body: message,
    });
    
    console.log(`✅ WhatsApp message sent to ${formattedNumber}: ${response.sid}`);
    return { success: true, sid: response.sid };
  } catch (error) {
    console.error(`❌ WhatsApp Error: ${error.message}`);
    return { success: false, message: error.message };
  }
};

/**
 * Send greetings for birthdays and work anniversaries
 * @param {Date|null} testDate - Optional test date
 */
export const sendGreetings = async (testDate = null) => {
  const TIMEZONE = "Asia/Kolkata";
  const todayStr = testDate
    ? moment(testDate).tz(TIMEZONE).format("MM-DD")
    : moment().tz(TIMEZONE).format("MM-DD");

  console.log(`Checking greetings for date: ${todayStr}`);

  try {
    // Find employees with birthday or work anniversary today
    const employees = await Employee.find({
      $or: [
        { $expr: { $eq: [{ $dateToString: { format: "%m-%d", date: "$birthday" } }, todayStr] } },
        { $expr: { $eq: [{ $dateToString: { format: "%m-%d", date: "$workAnniversary" } }, todayStr] } },
      ],
    });

    if (employees.length === 0) {
      console.log("✅ No birthdays or anniversaries today.");
      return { success: true, message: "No birthdays or anniversaries today" };
    }

    const results = [];
    
    // Process each employee
    for (const employee of employees) {
      const phoneNumber = employee.phone;
      const employeeResult = { name: employee.fullName, notifications: [] };

      // Check if today is their birthday
      if (moment(employee.birthday).tz(TIMEZONE).format("MM-DD") === todayStr) {
        console.log(`🎂 Sending birthday wish to: ${employee.fullName}`);

        // Send birthday email
        const emailResult = await sendEmail(
          employee.email, 
          `Happy Birthday, ${employee.fullName}! 🎉`, 
          `
          <div style="text-align: center; font-family: Arial, sans-serif;">
            <h1 style="color: #FF5722;">Happy Birthday, ${employee.fullName}! 🎉</h1>
            <p style="font-size: 18px;">Wishing you a wonderful day filled with joy and happiness.</p>
            <img src="https://cdn-images.dzcdn.net/images/cover/e23c61c14db46a8f2490ab147600ff17/0x1900-000000-80-0-0.jpg" alt="Happy Birthday" style="max-width: 100%; height: auto; border-radius: 10px;">
          </div>
          `
        );
        employeeResult.notifications.push({ type: "birthday-email", ...emailResult });

        // Send birthday WhatsApp message
        const whatsappResult = await sendWhatsAppMessage(
          phoneNumber, 
          `🎉 Happy Birthday, ${employee.fullName}! Wishing you a wonderful day filled with joy and happiness. 🎂🥳`
        );
        employeeResult.notifications.push({ type: "birthday-whatsapp", ...whatsappResult });
      }

      // Check if today is their work anniversary
      if (moment(employee.workAnniversary).tz(TIMEZONE).format("MM-DD") === todayStr) {
        console.log(`🎊 Sending anniversary wish to: ${employee.fullName}`);

        // Calculate years of service
        const yearsOfService = moment().diff(moment(employee.workAnniversary), 'years');
        const anniversaryYear = yearsOfService === 1 ? "1st" : 
                               yearsOfService === 2 ? "2nd" : 
                               yearsOfService === 3 ? "3rd" : 
                               `${yearsOfService}th`;

        // Send anniversary email
        const emailResult = await sendEmail(
          employee.email, 
          `Happy ${anniversaryYear} Work Anniversary, ${employee.fullName}! 🎉`,
          `
          <div style="text-align: center; font-family: Arial, sans-serif;">
            <h1 style="color: #4CAF50;">Happy ${anniversaryYear} Work Anniversary, ${employee.fullName}! 🎉</h1>
            <p style="font-size: 18px;">Thank you for ${yearsOfService} ${yearsOfService === 1 ? 'year' : 'years'} of dedication and excellent work!</p>
            <img src="https://i.ytimg.com/vi/CHuP5Fv1tBY/hq720.jpg" alt="Happy Anniversary" style="max-width: 100%; height: auto; border-radius: 10px;">
          </div>
          `
        );
        employeeResult.notifications.push({ type: "anniversary-email", ...emailResult });

        // Send anniversary WhatsApp message
        const whatsappResult = await sendWhatsAppMessage(
          phoneNumber, 
          `💖 Happy ${anniversaryYear} Work Anniversary, ${employee.fullName}! Thank you for ${yearsOfService} ${yearsOfService === 1 ? 'year' : 'years'} of dedication. Wishing you more success and happiness ahead. 🎊🎶`
        );
        employeeResult.notifications.push({ type: "anniversary-whatsapp", ...whatsappResult });
      }

      results.push(employeeResult);
    }

    console.log(`✅ Processed greetings for ${employees.length} employees.`);
    return { success: true, results };
    
  } catch (error) {
    console.error("❌ Error in sendGreetings:", error.message);
    return { success: false, message: error.message };
  }
};

// Export functions for use in other files
export { sendEmail, sendWhatsAppMessage };