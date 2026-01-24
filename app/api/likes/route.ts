import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Question from '@/lib/models/Question';
import Answer from '@/lib/models/Answer';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

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

        const userId = (decoded as any).userId;
        const { targetId, type } = await request.json(); // type: 'question' or 'answer'

        if (!targetId || !type) {
            return NextResponse.json({ error: 'Target ID and type required' }, { status: 400 });
        }

        await connectToDatabase();

        let Model: any;
        if (type === 'question') Model = Question;
        else if (type === 'answer') Model = Answer;
        else return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

        const item = await Model.findById(targetId);
        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        // Toggle like
        const likedIndex = item.likes.indexOf(userId);
        let isLiked = false;

        if (likedIndex === -1) {
            item.likes.push(userId);
            isLiked = true;
        } else {
            item.likes.splice(likedIndex, 1);
            isLiked = false;
        }

        await item.save();

        return NextResponse.json({
            likes: item.likes.length,
            isLiked
        }, { status: 200 });

    } catch (error) {
        console.error('Like error:', error);
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}
