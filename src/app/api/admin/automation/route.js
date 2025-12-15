import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AutomationLog } from '@/models/index';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendEmail } from '@/lib/email';

// Helper
async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session && session.user.role === 'admin';
}

export async function GET(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const logs = await AutomationLog.findAll({
            order: [['createdAt', 'DESC']],
            limit: 50 // Limit to last 50 for now
        });
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await req.json();
        const log = await AutomationLog.findByPk(id);

        if (!log) return NextResponse.json({ error: 'Log not found' }, { status: 404 });

        // REAL RETRY LOGIC
        if (log.type === 'EMAIL') {
            const { subject, body } = log.payload;
            const sent = await sendEmail(log.target, subject, body);

            log.status = sent ? 'SUCCESS' : 'FAILED';
            log.retryCount += 1;
            log.error = sent ? null : 'Retry failed. Check .env.';
            await log.save();
        } else {
            // For now only EMAIL is supported
            return NextResponse.json({ error: 'Unsupported automation type' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Retried successfully', log });
    } catch (error) {
        console.error("Retry Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
