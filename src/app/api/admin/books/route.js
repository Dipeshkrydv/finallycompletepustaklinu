import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Book, User } from '@/models/index';
import { authOptions } from '../../auth/[...nextauth]/route';

// Helper to check admin
async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session && session.user.role === 'admin';
}

export async function GET(req) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const books = await Book.findAll({
            include: [{ model: User, as: 'seller', attributes: ['name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        return NextResponse.json(books);
    } catch (error) {
        console.error('Admin books fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
        }

        const book = await Book.findByPk(id);
        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        await book.destroy();

        return NextResponse.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Admin book delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
        }

        const book = await Book.findByPk(id);
        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        await book.update(updates);

        return NextResponse.json({ message: 'Book updated successfully', book });
    } catch (error) {
        console.error('Admin book update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
