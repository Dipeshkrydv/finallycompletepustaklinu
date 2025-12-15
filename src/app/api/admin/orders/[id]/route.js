import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Order, Message, Book, User } from '@/models/index';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await req.json();

        const order = await Order.findByPk(id, {
            include: [{
                model: Book,
                as: 'book',
                include: [{ model: User, as: 'seller' }]
            }]
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const updateData = { status };

        // Automated Message on Confirmation
        if (status === 'confirmed' && order.buyerId) {
            const seller = order.book?.seller;

            // Set follow-up to start in 2 minutes (for testing/demo purposes) 
            // In real prod, might use new Date(Date.now() + 60 * 60 * 1000) for 1 hour
            updateData.followUpStartTime = new Date(Date.now() + 2 * 60 * 1000);
            updateData.isCompleted = false;

            let msgContent = `Hello! Your order #${order.id} for "${order.book?.title}" has been confirmed.`;
            if (seller) {
                msgContent += `\n\nHere are the Seller Details:\nName: ${seller.name}\nPhone: ${seller.phone || 'N/A'}\nEmail: ${seller.email}\nAddress: ${seller.address || seller.city || 'N/A'}`;
                msgContent += `\n\nPlease contact the seller to arrange collection/delivery.`;
            }

            await Message.create({
                senderId: session.user.id,
                receiverId: order.buyerId,
                content: msgContent
            });
        }

        await order.update(updateData);

        return NextResponse.json(order);
    } catch (error) {
        console.error('Admin Order Update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
