import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Order } from '@/models/index';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await req.json();

        const order = await Order.findByPk(id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        await order.update({ status });

        return NextResponse.json(order);
    } catch (error) {
        console.error('Admin Order Update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
