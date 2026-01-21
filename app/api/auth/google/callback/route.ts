import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
        }

        const tokenResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

        if (!tokenResponse.ok) {
            console.error('[GoogleCallback] Token validation failed:', tokenResponse.status, tokenResponse.statusText);
            return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 });
        }


        const googleUser = await tokenResponse.json();

        // Security: Verify the token is intended for this app
        const expectedAud = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (googleUser.aud !== expectedAud) {
            console.error(`[GoogleCallback] Token audience mismatch. Expected: ${expectedAud}, Got: ${googleUser.aud}`);
            // Note: If using direct Google OAuth, 'aud' might be Client ID. 
            // Only reject if we are sure check is valid. 
            // For Firebase ID Tokens, aud IS the Project ID.
            if (expectedAud) {
                return NextResponse.json({ error: 'Invalid token audience' }, { status: 403 });
            }
        }

        if (!googleUser.sub || !googleUser.email) {
            return NextResponse.json({ error: 'Incomplete user data from token' }, { status: 400 });
        }

        await connectToDatabase();

        let user = await User.findOne({ googleId: googleUser.sub });

        if (!user) {
            user = await User.findOne({ email: googleUser.email });
            if (user) {
                user.googleId = googleUser.sub;
                await user.save();
            } else {
                let baseUsername = googleUser.name?.replace(/\s+/g, '').toLowerCase() || googleUser.email.split('@')[0];
                let username = baseUsername;
                let counter = 1;

                while (await User.exists({ username })) {
                    username = `${baseUsername}${counter}`;
                    counter++;
                }

                user = await User.create({
                    username,
                    email: googleUser.email,
                    googleId: googleUser.sub,
                });
            }
        }

        const token = signToken({ userId: user._id, username: user.username });

        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24, // 1 day
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[GoogleCallback] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
