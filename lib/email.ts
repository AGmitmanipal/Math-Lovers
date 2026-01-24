import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendCustomVerificationEmail(email: string, link: string) {
    if (process.env.SMTP_HOST === 'smtp.example.com' || !process.env.SMTP_HOST) {
        console.warn('SMTP not configured (using placeholders). Skipping email send.');
        console.log('Verification Link:', link);
        return; // Early return to prevent crash
    }

    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Math Lovers'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify your Math Lovers account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #000;">Welcome to Math Lovers!</h2>
                <p>Please click the button below to verify your email address and start solving.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${link}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
                </div>
                <p style="color: #666; font-size: 14px;">Or copy this link to your browser:</p>
                <p style="color: #666; font-size: 12px; word-break: break-all;">${link}</p>
                <p style="margin-top: 40px; color: #999; font-size: 12px;">If you didn't create an account, you can ignore this email.</p>
            </div>
        `,
    };

    try {
        await transporter.verify();
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
    } catch (error: any) {
        console.error('Error sending email:', error);
        // Expose underlying error message to API for easy debugging
        throw new Error(`Failed to send verification email: ${error.message || error}`);
    }
}
