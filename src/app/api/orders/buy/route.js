import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Cart, Order, Book } from '@/models/index';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all items from cart
    const { cartItems } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Create orders for each item
    for (const item of cartItems) {
      // Check if book is still available
      const book = await Book.findByPk(item.id);
      if (!book || book.status !== 'available') {
        console.log(`Order failed: Book ${item.id} is no longer available`);
        continue; // Skip this item or you could throw an error to fail the whole batch
      }

      await Order.create({
        buyerId: session.user.id,
        bookId: item.id,
        status: 'pending',
        totalAmount: item.price,
      });

      // Update book status to on-hold
      await book.update({ status: 'on-hold' });
    } // This closes the for loop
    // We don't clear backend cart because we aren't using it.

    // Notification to Admin (Simulated by Admin checking orders)
    // In a real app, we might send an email or push notification here.

    return NextResponse.json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error('Order POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
