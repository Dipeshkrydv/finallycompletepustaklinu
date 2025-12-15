import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Order, Book, Message, User, AutomationLog } from '@/models/index';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { sendEmail } from '@/lib/email';

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { confirmation } = await req.json(); // expecting true

        if (!confirmation) {
            return NextResponse.json({ error: 'Confirmation required' }, { status: 400 });
        }

        const order = await Order.findByPk(id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.buyerId !== session.user.id && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized to complete this order' }, { status: 403 });
        }

        // Fetch full order details including Seller
        const fullOrder = await Order.findByPk(id, {
            include: [
                { model: Book, as: 'book', include: [{ model: User, as: 'seller' }] },
                { model: User, as: 'buyer' } // Ensure buyer is loaded
            ]
        });

        // update order
        await fullOrder.update({
            status: 'delivered',
            isCompleted: true
        });

        // DELETE (or archive) the book
        if (fullOrder.bookId) {
            await Book.destroy({ where: { id: fullOrder.bookId } });
        }

        const buyer = fullOrder.buyer;
        const seller = fullOrder.book?.seller;

        // --- AUTOMATION: FINAL CONFIRMATION & DONATION ---

        // 1. Notify Buyer
        const buyerMsg = `
Order #${fullOrder.id} is marked as COMPLETE & DELIVERED!
We hope you enjoy your book "${fullOrder.book?.title}".

DONATION REMINDER:
To support Pustaklinu, please remember to pay the 10% Donation Fee (Rs. ${Math.round((fullOrder.totalAmount || 0) * 0.10)}).
Payment Methods: eSewa, Khalti, Bank Transfer.
        `.trim();

        // Send Email
        const buyerEmailSent = await sendEmail(buyer.email, `Order Complete: ${fullOrder.book?.title}`, buyerMsg);

        // Log & Message
        await Message.create({ senderId: 1, receiverId: buyer.id, content: buyerMsg });
        await AutomationLog.create({
            type: 'EMAIL',
            target: buyer.email,
            status: buyerEmailSent ? 'SUCCESS' : 'FAILED',
            payload: { subject: `Order Complete`, body: buyerMsg },
            error: buyerEmailSent ? null : 'Failed to send complete email.'
        });

        // 2. Notify Seller
        if (seller) {
            const sellerMsg = `
Success! Your book "${fullOrder.book?.title}" has been marked as DELIVERED by the buyer.
The transaction is complete.

DONATION REMINDER:
Please pay your 5% Platform Fee if applicable.
Thank you for using Pustaklinu!
            `.trim();

            const sellerEmailSent = await sendEmail(seller.email, `Book Delivered: ${fullOrder.book?.title}`, sellerMsg);

            await Message.create({ senderId: 1, receiverId: seller.id, content: sellerMsg });
            await AutomationLog.create({
                type: 'EMAIL',
                target: seller.email,
                status: sellerEmailSent ? 'SUCCESS' : 'FAILED',
                payload: { subject: `Book Delivered`, body: sellerMsg },
                error: sellerEmailSent ? null : 'Failed to send complete email.'
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Order Complete Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
