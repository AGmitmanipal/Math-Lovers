import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: Request) {
    try {
        const { username } = await request.json();

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        await connectToDatabase();

        const exists = await User.exists({ username }); // Case sensitive usually, but collation might be needed if strict
        // Mongoose usually handles exact match. If we want case-insensitive, we should use Regex or collation.
        // User schema has "unique: true", but "username" field might be case sensitive depending on DB collation.
        // However, User.findOne({ username }) is standard.

        // Let's do a case-insensitive check just to be safe and cleaner for users
        const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

        if (user) {
            return NextResponse.json({ available: false });
        }

        return NextResponse.json({ available: true });

    } catch (error) {
        console.error('Check Username Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
