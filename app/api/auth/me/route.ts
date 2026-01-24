import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token');

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized: No token provided' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token.value);

        // Check if token is valid and has the expected payload structure
        if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid token' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const user = await User.findById((decoded as any).userId).select('-password');

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized: User not found' },
                { status: 401 }
            );
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error('Me error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
