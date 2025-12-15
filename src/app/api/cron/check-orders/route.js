import { NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { Order, Message } from '@/models/index';
// Note: We don't check for session here strictly if we want this to be callable by a real cron service externally,
// but for the dashboard-polling approach, checking for admin session is good for security.
// However, if we want to allow a simple "visit this URL" trigger, we might optionalize it.
// For now, let's keep it open or require a secret key if deployed. 
// Given the context, we'll allow it if called from same origin or with admin session.

export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        // Allow if admin session OR if a secret header is present (for external cron services)
        const authHeader = req.headers.get('authorization');
        const isAuthorized = (session && session.user.role === 'admin') || (authHeader === `Bearer ${process.env.CRON_SECRET}`);

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();

        // Find orders that:
        // 1. Are confirmed
        // 2. Are NOT completed
        // 3. Have a followUpStartTime that is in the PAST (time to start messaging)
        // 4. Either NEVER had a follow-up, OR last follow-up was > 5 minutes ago
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        const orders = await Order.findAll({
            where: {
                status: 'confirmed',
                isCompleted: false,
                followUpStartTime: {
                    [Op.lte]: now // Start time has passed
                },
                [Op.or]: [
                    { lastFollowUpSentAt: null },
                    { lastFollowUpSentAt: { [Op.lt]: fiveMinutesAgo } }
                ]
            }
        });

        if (orders.length === 0) {
            return NextResponse.json({ message: 'No orders need follow-up', count: 0 });
        }

        let sentCount = 0;
        for (const order of orders) {
            // Send the "Is success?" message
            const completionLink = `${process.env.NEXTAUTH_URL}/dashboard/buyer/orders/complete/${order.id}`;

            await Message.create({
                senderId: 1, // Assuming ID 1 is System/Admin. Ideally use a dedicated System bot ID.
                receiverId: order.buyerId,
                content: `Hi! Has your order #${order.id} been successfully delivered?\n\nIf YES, please click here to confirm and removed the book listing:\n${completionLink}`
            });

            // Update lastFollowUpSentAt
            await order.update({ lastFollowUpSentAt: now });
            sentCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Sent follow-ups to ${sentCount} orders`,
            processed: sentCount
        });

    } catch (error) {
        console.error('Cron Check-Orders Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
