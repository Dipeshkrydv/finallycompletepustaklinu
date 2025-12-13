import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Cart, Book } from '@/models/index';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cartItems = await Cart.findAll({
      where: { buyerId: session.user.id },
      include: [{ model: Book, as: 'book' }] // Ensure association alias matches
    });

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookId } = await req.json();
    
    const existingItem = await Cart.findOne({
      where: { buyerId: session.user.id, bookId }
    });

    if (existingItem) {
      return NextResponse.json({ message: 'Item already in cart' });
    }

    const newItem = await Cart.create({
      buyerId: session.user.id,
      bookId
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'buyer') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            await Cart.destroy({ where: { id, buyerId: session.user.id } });
        } else {
            // Clear cart
            await Cart.destroy({ where: { buyerId: session.user.id } });
        }
    
        return NextResponse.json({ message: 'Cart updated' });
      } catch (error) {
        console.error('Cart DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
}
