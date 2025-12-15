import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Order, Book, User, Message, AutomationLog } from '@/models/index';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendEmail } from '@/lib/email';

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

        // Update Book Status to 'sold' (effectively removing it from listings)
        if (order.book) {
            await order.book.update({ status: 'sold' });
        }

        // AUTOMATED MESSAGE GENERATION
        // AUTOMATED MESSAGE GENERATION
        const seller = order.book?.seller;
        const buyer = order.buyer;

        if (seller && buyer) {
            // 1. Notify BUYER with Seller Details
            const sellerInfoForBuyerText = `
Order (#${order.id}) Confirmed!
Here are the seller details for your book "${order.book.title}":

Name: ${seller.name}
Phone: ${seller.phone || 'N/A'}
Email: ${seller.email || 'N/A'}
City: ${seller.city || 'N/A'}

IMPORTANT: After you receive the book, please remember to pay the platform donation fee (10% of price) via eSewa, Khalti, or Bank Transfer.
Details are available in your dashboard.
            `.trim();

            const sellerInfoForBuyerHTML = `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #f59e0b; padding: 20px; text-align: center;">
    <h2 style="color: white; margin: 0;">Order Confirmed!</h2>
  </div>
  <div style="padding: 20px;">
    <p>Hi ${buyer.name},</p>
    <p>Good news! Your order for <strong>${order.book.title}</strong> has been confirmed by the Admin.</p>
    
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #d97706;">Seller Contact Details</h3>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${seller.name}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${seller.phone || 'N/A'}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${seller.email || 'N/A'}</p>
      <p style="margin: 5px 0;"><strong>City:</strong> ${seller.city || 'N/A'}</p>
    </div>

    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-top: 20px;">
      <p style="margin: 0; font-weight: bold; color: #1e40af;">❤️ Donation Reminder</p>
      <p style="margin: 5px 0 0; color: #1e3a8a;">
        Please stick to your promise! After you meet the seller and get your book, don't forget to pay the <strong>10% platform donation fee</strong>.
        You can pay via eSewa, Khalti, or Bank Transfer.
      </p>
    </div>
    
    <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
      This is an automated message from Pustaklinu.
    </p>
  </div>
</div>
            `.trim();

            await Message.create({
                content: adminNote ? `${sellerInfoForBuyerText}\n\nAdmin Note: ${adminNote}` : sellerInfoForBuyerText,
                senderId: session.user.id,
                receiverId: buyer.id
            });

            // 2. Notify SELLER with Buyer Details
            const buyerInfoForSeller = `
Great news! Your book "${order.book.title}" has been sold!
Here are the buyer details to arrange exchange:
Name: ${buyer.name}
Phone: ${buyer.phone || 'N/A'}
Email: ${buyer.email || 'N/A'}
Location: ${buyer.city || 'N/A'}

Price: Rs. ${order.book.price}
Status: Confirmed

Please contact the buyer to complete the handover.
            `.trim();

            await Message.create({
                content: buyerInfoForSeller,
                senderId: session.user.id,
                receiverId: seller.id
            });

            // 3. Automate Email Logs (Real Sending)

            // Notify Buyer via Email
            const buyerEmailSent = await sendEmail(
                buyer.email,
                `Order #${order.id} Confirmed - Pustaklinu`,
                sellerInfoForBuyerText,
                sellerInfoForBuyerHTML
            );

            await AutomationLog.create({
                type: 'EMAIL',
                target: buyer.email,
                status: buyerEmailSent ? 'SUCCESS' : 'FAILED',
                payload: { subject: `Order #${order.id} Confirmed`, body: sellerInfoForBuyerText },
                retryCount: 0,
                error: buyerEmailSent ? null : 'Failed to send email. Check .env for GMAIL_PASS.'
            });

            // Notify Seller via Email
            const sellerEmailSent = await sendEmail(
                seller.email,
                `Book Sold: ${order.book.title} - Pustaklinu`,
                buyerInfoForSeller
            );

            await AutomationLog.create({
                type: 'EMAIL',
                target: seller.email,
                status: sellerEmailSent ? 'SUCCESS' : 'FAILED',
                payload: { subject: `Book Sold: ${order.book.title}`, body: buyerInfoForSeller },
                retryCount: 0,
                error: sellerEmailSent ? null : 'Failed to send email. Check .env for GMAIL_PASS.'
            });
        }

        return NextResponse.json({ message: 'Order confirmed and notification sent', order });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
