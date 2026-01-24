import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Question from '@/lib/models/Question';
import User from '@/lib/models/User'; // Import to populate
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        // Fetch questions, sort by newest first, populate author
        const questions = await Question.find({})
            .sort({ createdAt: -1 })
            .populate('author', 'username') // Only get username
            .exec();

        return NextResponse.json({ questions }, { status: 200 });
    } catch (error) {
        console.error('Fetch questions error:', error);
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token.value);
        if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { title, content, tags, image } = await request.json();

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        await connectToDatabase();

        const newQuestion = await Question.create({
            title,
            content,
            tags: tags || [],
            image,
            author: (decoded as any).userId,
        });

        return NextResponse.json({ question: newQuestion }, { status: 201 });
    } catch (error) {
        console.error('Create question error:', error);
        return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
    }
}
