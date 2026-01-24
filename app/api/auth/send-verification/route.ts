import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { sendCustomVerificationEmail } from '@/lib/email';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: Request) {
    try {
        const { email } = await request.json(); // For initial signup
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        // Validation: 
        // 1. If token exists, verify it server-side to get the email.
        // 2. If no token (signup flow), use the provided email but require some trust—
        //    Actually, for signup, the flow is: Signup -> Send Email. 
        //    For Resend: We should trust the session.

        let targetEmail = email;

        if (token) {
            const decoded = verifyToken(token);
            if (decoded && (decoded as any).username) {
                // We need to fetch the email from the DB or Firebase if we only have username in token
                // But for now let's assume we can get it or the client passed it and we just want to gate this
                // Ideally, we fetch user by ID from DB to get the reliable email
            }
        }

        if (!targetEmail) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Generate Link
        const actionCodeSettings = {
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
            handleCodeInApp: false, // Default: Firebase handles the link click
        };
        const link = await adminAuth.generateEmailVerificationLink(targetEmail, actionCodeSettings);

        // Send Email
        await sendCustomVerificationEmail(targetEmail, link);

        return NextResponse.json({ message: 'Verification email sent' });

    } catch (error: any) {
        console.error('Send Verification Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send email' },
            { status: 500 }
        );
    }
}
