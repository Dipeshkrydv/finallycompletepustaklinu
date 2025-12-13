import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Order, Book, User, Message } from '@/models/index';
import { authOptions } from '../../../../auth/[...nextauth]/route';

export async function POST(req, { params }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const orderId = params.id;
        const body = await req.json().catch(() => ({})); // Handle if body is optional/empty
        const { adminNote } = body;

        const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: Book,
                    as: 'book',
                    include: [{ model: User, as: 'seller' }]
                },
                { model: User, as: 'buyer' }
            ]
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Update Order Status
        order.status = 'accepted';
        await order.save();

        // AUTOMATED MESSAGE GENERATION
        const seller = order.book?.seller;
        if (seller) {
            const sellerInfo = `
Order Confirmed! Here are the seller details:
Name: ${seller.name}
Phone: ${seller.phone || 'N/A'}
Location: ${seller.address || 'N/A'}, ${seller.city || 'N/A'}

IMPORTANT: Don't forget to pay donation of app that is 10 percentage of the book in our esewa or khalti or ncelll number or bank.
            `.trim();

            const finalMessage = adminNote ? `${sellerInfo}\n\nAdmin Note: ${adminNote}` : sellerInfo;

            await Message.create({
                content: finalMessage,
                senderId: session.user.id, // Sent by Admin
                receiverId: order.buyerId
            });
        }

        return NextResponse.json({ message: 'Order confirmed and notification sent', order });
    } catch (error) {
        console.error('Order Confirm Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
