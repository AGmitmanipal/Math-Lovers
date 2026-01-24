import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
    try {
        console.log('[TestDB] Connecting...');
        const start = Date.now();
        await connectToDatabase();
        const duration = Date.now() - start;
        console.log(`[TestDB] Connected in ${duration}ms`);

        // Try a simple query
        const count = await User.countDocuments();
        console.log(`[TestDB] User count: ${count}`);

        return NextResponse.json({
            status: 'success',
            message: 'Database connected successfully',
            userCount: count,
            duration: `${duration}ms`
        });
    } catch (error: any) {
        console.error('[TestDB] Connection failed:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
