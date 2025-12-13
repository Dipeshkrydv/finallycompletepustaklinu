import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Order, Book } from '@/models/index';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await req.json();

    const order = await Order.findByPk(id);
    if (!order) {
      console.log(`Cancel Order: Order ${id} not found`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log(`Cancel Order: Found order ${id}, Status: ${order.status}, User: ${session.user.id}, Buyer: ${order.buyerId}`);

    // Allow buyer to cancel or confirm delivery
    if (session.user.role === 'buyer') {
      if (order.buyerId !== session.user.id) {
        console.log(`Update Order: Unauthorized buyer`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Handle Cancellation
      if (status === 'cancelled' && order.status === 'pending') {
        order.status = 'cancelled';
        await order.save();

        // Revert book status to available
        console.log(`Cancel Order: Reverting Book ${order.bookId} to available`);
        await Book.update({ status: 'available' }, { where: { id: order.bookId } });

        return NextResponse.json(order);
      }

      // Handle Delivery Confirmation (Order Success)
      else if (status === 'delivered' && order.status === 'accepted') {
        order.status = 'delivered';
        await order.save();

        // Mark book as sold instead of deleting so history is preserved
        console.log(`Order Delivered: Marking Book ${order.bookId} as sold`);
        const book = await Book.findByPk(order.bookId);
        if (book) {
          await book.update({ status: 'sold' });
        }

        return NextResponse.json({ message: 'Order confirmed and book marked as sold', order });
      }

      else {
        console.log(`Update Order: Invalid state transition. Request status: ${status}, Current: ${order.status}`);
        return NextResponse.json({ error: 'Cannot update this order state' }, { status: 400 });
      }
    }

    // Seller Logic: specific check before Admin fallback
    if (session.user.role === 'seller') {
      // Verify seller owns the book
      const book = await Book.findByPk(order.bookId);
      if (!book || book.sellerId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (status === 'accepted' && order.status === 'pending') {
        order.status = 'accepted';
        await order.save();
        return NextResponse.json({ message: 'Order accepted', order });
      }
      else if (status === 'rejected' && order.status === 'pending') {
        order.status = 'rejected';
        await order.save();
        return NextResponse.json({ message: 'Order rejected', order });
      }
      else {
        return NextResponse.json({ error: 'Invalid state transition for seller' }, { status: 400 });
      }
    }

    // Admin logic (if needed later) or Seller logic could go here
    if (session.user.role === 'admin') {
      // Admin override if needed in future
    }

    return NextResponse.json({ error: 'Action not allowed' }, { status: 403 });
  } catch (error) {
    console.error('Order PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const order = await Order.findByPk(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow deletion if user owns the order
    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only allow deletion of terminal states
    if (!['cancelled', 'rejected', 'delivered'].includes(order.status)) {
      return NextResponse.json({ error: 'Cannot delete active orders' }, { status: 400 });
    }

    await order.destroy();

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Order DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
