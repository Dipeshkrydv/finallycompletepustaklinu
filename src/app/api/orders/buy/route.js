import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Order, Book } from '@/models/index';
import { authOptions } from '../../auth/[...nextauth]/route';
import sequelize from '@/lib/db';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { cartItems } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty. Please add books before checkout.' }, { status: 400 });
    }

    await sequelize.transaction(async (t) => {
      for (const item of cartItems) {
        // Frontend sends item.id as the book ID (from book.id)
        const bookId = item.id || item.bookId;

        const book = await Book.findByPk(bookId, { transaction: t });

        if (!book) {
          throw new Error(`Book with ID ${bookId} not found.`);
        }

        if (book.status !== 'available') {
          throw new Error(`Book "${book.title}" is no longer available.`);
        }

        // Create the order
        await Order.create({
          buyerId: session.user.id,
          bookId: book.id,
          status: 'pending',
          totalAmount: book.price, // Trust DB price
        }, { transaction: t });

        // Mark book as on-hold immediately
        await book.update({ status: 'on-hold' }, { transaction: t });
      }
    });

    return NextResponse.json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error('Order POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
