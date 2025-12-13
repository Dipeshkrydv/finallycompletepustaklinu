import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Order, Book, User } from '@/models/index';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await Order.findAll({
      where: { buyerId: session.user.id },
      include: [
        { model: Book, as: 'book', include: [{ model: User, as: 'seller', attributes: ['name', 'city'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
