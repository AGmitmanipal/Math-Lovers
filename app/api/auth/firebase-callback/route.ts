import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { idToken, username: providedUsername } = await request.json();

        if (!idToken) {
            return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
        }

        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;

        const response = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
        });

        if (!response.ok) {
            console.error('Firebase token verification failed');
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const data = await response.json();
        const firebaseUser = data.users[0];
        const { localId: uid, email, emailVerified } = firebaseUser;

        await connectToDatabase();

        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            // Check if user exists by email (link accounts)
            user = await User.findOne({ email });

            if (user) {
                user.firebaseUid = uid;
                await user.save();
            } else {
                // Create new user
                let username = providedUsername;

                // If no username provided, or if provided username is taken, generate/validate
                if (username) {
                    const existingUsername = await User.findOne({ username });
                    if (existingUsername) {
                        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
                    }
                } else {
                    // Generate unique username from email
                    const baseUsername = email.split('@')[0];
                    username = baseUsername;
                    let counter = 1;
                    while (await User.exists({ username })) {
                        username = `${baseUsername}${counter}`;
                        counter++;
                    }
                }

                user = await User.create({
                    username,
                    email,
                    firebaseUid: uid,
                    // If created via google sign in previously it might have googleId, but here we are clean
                });
            }
        }

        // Update verification status ? 
        // We generally rely on the token, but we could update the DB if we wanted? 
        // For 'minimal auth state', we don't need to persist 'emailVerified' in Mongo if we just use the token claims.
        // But the requirements say "Detect user.emailVerified in Firebase Auth state" and "Store only minimal auth state".

        // Generate Session Token
        const token = signToken({
            userId: user._id,
            username: user.username,
            emailVerified: emailVerified
        });

        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        return NextResponse.json({ success: true, user: { username: user.username, emailVerified } });

    } catch (error) {
        console.error('Auth Callback Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
