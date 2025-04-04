import nodemailer from 'nodemailer';

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP_USER and SMTP_PASS must be set in environment variables.');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Sends an email.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Subject of the email.
 * @param {string} text - Plain text content of the email.
 * @param {string} [html] - Optional HTML content of the email.
 * @returns {Promise} - Resolves if email is sent successfully, rejects otherwise.
 */
export const sendEmail = async (to, subject, text, html = null) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to,
            subject,
            text,
            ...(html && { html })
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.response);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        throw error;
    }
};

/**
 * Sends a password reset link to the given email address.
 * @param {string} email - Recipient email address.
 * @param {string} resetLink - URL for resetting the password.
 */
export const sendResetLink = async (email, resetLink) => {
    const subject = 'Password Reset Link';
    const text = `Click the link to reset your password: ${resetLink}`;
    const html = `<p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`;

    try {
        await sendEmail(email, subject, text, html);
        console.log('✅ Reset link sent successfully to:', email);
    } catch (error) {
        console.error('❌ Error sending reset link to:', email, error.message);
    }
};
