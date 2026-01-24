import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Question from '@/lib/models/Question';
import Answer from '@/lib/models/Answer';
import User from '@/lib/models/User';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDatabase();

        const question = await Question.findById(id).populate('author', 'username');

        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        // Also fetch answers for this question
        const answers = await Answer.find({ questionId: id })
            .sort({ createdAt: -1 }) // Newest first or maybe by likes later
            .populate('author', 'username');

        return NextResponse.json({ question, answers }, { status: 200 });

    } catch (error) {
        console.error('Fetch question error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
