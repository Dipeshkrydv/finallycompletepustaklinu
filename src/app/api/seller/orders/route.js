import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Order, Book, User } from '@/models/index';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'seller') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find orders where the associated book has sellerId = session.user.id
        const orders = await Order.findAll({
            include: [
                {
                    model: Book,
                    as: 'book',
                    where: { sellerId: session.user.id },
                    attributes: ['title', 'price', 'images']
                },
                {
                    model: User,
                    as: 'buyer',
                    attributes: ['name', 'email', 'phone', 'city']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Seller Orders GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
