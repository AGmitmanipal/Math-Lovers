import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Question from '@/lib/models/Question'; // Also deletes answers related? We'll handle that.
import Answer from '@/lib/models/Answer';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // Question ID
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token.value);
        if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        const currentUserId = (decoded as any).userId;

        await connectToDatabase();

        const question = await Question.findById(id);
        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        // Check ownership
        if (question.author.toString() !== currentUserId) {
            return NextResponse.json({ error: 'Forbidden: You can only delete your own questions' }, { status: 403 });
        }

        // Delete the question
        await Question.findByIdAndDelete(id);

        // Optionally delete all answers to this question to keep DB clean
        await Answer.deleteMany({ questionId: id });

        return NextResponse.json({ message: 'Question deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Delete question error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
