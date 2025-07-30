import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testEmailConfiguration = async () => {
    console.log('Testing email configuration...');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

    try {
        // Create transporter
        const transporter = nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Verify connection configuration
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Email configuration is valid!');

        // Send test email
        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"MediCare AI Test" <${process.env.EMAIL_FROM}>`,
            to: process.env.EMAIL_USERNAME, // Send to yourself for testing
            subject: 'Test Email - MediCare AI Password Reset',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Test Email</h2>
                    <p>This is a test email to verify your email configuration for MediCare AI password reset functionality.</p>
                    <p>If you received this email, your configuration is working correctly!</p>
                </div>
            `
        });

        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Email configuration error:', error.message);

        if (error.code === 'EAUTH') {
            console.log('\n🔧 Authentication failed. Please check:');
            console.log('1. EMAIL_USERNAME is correct');
            console.log('2. EMAIL_PASSWORD is your App Password (not regular password)');
            console.log('3. 2-Step Verification is enabled for Gmail');
        } else if (error.code === 'ECONNECTION') {
            console.log('\n🔧 Connection failed. Please check:');
            console.log('1. EMAIL_HOST and EMAIL_PORT are correct');
            console.log('2. Your internet connection');
        }
    }
};

// Run the test
testEmailConfiguration();
