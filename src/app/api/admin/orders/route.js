import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Order, Book, User } from '@/models/index';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await Order.findAll({
      include: [
        { model: Book, as: 'book', include: [{ model: User, as: 'seller', attributes: ['name', 'phone', 'email'] }] },
        { model: User, as: 'buyer', attributes: ['name', 'phone', 'email', 'address', 'city', 'state'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Admin Orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
