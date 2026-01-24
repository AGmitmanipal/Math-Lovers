import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Question from '@/lib/models/Question';
import User from '@/lib/models/User';

export async function GET() {
    try {
        await connectToDatabase();

        // Ensure User model is initialized to avoid MissingSchemaError if used implicitly
        // Aggregation uses collection name 'users', which Mongoose derives from 'User' model

        const rankings = await Question.aggregate([
            {
                $group: {
                    _id: '$author',
                    questionCount: { $sum: 1 },
                    totalLikes: {
                        $sum: {
                            $cond: { if: { $isArray: "$likes" }, then: { $size: "$likes" }, else: 0 }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: {
                    path: '$userInfo',
                    preserveNullAndEmptyArrays: false // Only include users that exist
                }
            },
            {
                $project: {
                    _id: 1,
                    username: '$userInfo.username',
                    questionCount: 1,
                    totalLikes: 1
                }
            },
            {
                $sort: {
                    questionCount: -1, // Most questions first
                    totalLikes: -1     // Then most likes
                }
            },
            {
                $limit: 20
            }
        ]);

        return NextResponse.json(rankings);
    } catch (error) {
        console.error('Rankings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}