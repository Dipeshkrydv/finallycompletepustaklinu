import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Feedback, User } from '@/models/index';
import { authOptions } from '../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const feedbacks = await Feedback.findAll({
            where: { isPublic: true },
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'role']
            }],
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        return NextResponse.json(feedbacks);
    } catch (error) {
        console.error('Feedback GET Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { rating, comment } = await req.json();

        if (!rating || !comment) {
            return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 });
        }

        // Verify user exists (handle stale sessions after DB sync)
        const userExists = await User.findByPk(session.user.id);
        if (!userExists) {
            return NextResponse.json({ error: 'User not found. Please login again.' }, { status: 401 });
        }

        const newFeedback = await Feedback.create({
            userId: session.user.id,
            rating,
            comment,
            isPublic: true // Auto-approve for now, or set to false for moderation
        });

        // Return with user details for immediate display
        const feedbackWithUser = await Feedback.findByPk(newFeedback.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'role']
            }]
        });

        return NextResponse.json(feedbackWithUser);

    } catch (error) {
        console.error('Feedback POST Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
