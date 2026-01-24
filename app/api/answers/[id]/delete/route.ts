import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Answer from '@/lib/models/Answer';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Answer ID
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
        const currentUserId = (decoded as any).userId;

        await connectToDatabase();
        // Ensure models are compiled
        const fs = typeof import('fs'); // dummy check or just import
        // console.log(`[DELETE] Request to delete answer ${id} by user ${currentUserId}`);

        const answer = await Answer.findById(id);
        if (!answer) {
            return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
        }

        // Check ownership
        // Note: Question owner allowing to delete comments? Usually only comment owner.
        // Let's stick to strict comment ownership for now as requested "del the comments" usually implies user's own.
        if (answer.author.toString() !== currentUserId) {
            return NextResponse.json({ error: 'Forbidden: You can only delete your own answers' }, { status: 403 });
        }

        await Answer.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Answer deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Delete answer error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
