import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Answer from '@/lib/models/Answer';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Question ID
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token.value);
        if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { content, image } = await request.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        await connectToDatabase();

        const newAnswer = await Answer.create({
            content,
            image,
            questionId: id,
            author: (decoded as any).userId,
        });

        // Populate author before returning to make UI update easier
        const populatedAnswer = await Answer.findById(newAnswer._id).populate('author', 'username');

        return NextResponse.json({ answer: populatedAnswer }, { status: 201 });
    } catch (error) {
        console.error('Create answer error:', error);
        return NextResponse.json({ error: 'Failed to post answer' }, { status: 500 });
    }
}
