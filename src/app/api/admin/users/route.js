import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { User, Book, Order, Cart, Message } from '@/models/index'; // Import related models for cascade delete if not handled by DB
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
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            // Fetch single user with details
            const user = await User.findByPk(id, {
                attributes: { exclude: ['password'] },
                include: [
                    { model: Order, as: 'orders', include: [{ model: Book, as: 'book' }] }, // Orders they bought
                    // Note: If we want orders they SOLD, we need to query Book -> Order. Complex relation.
                    // Assuming 'orders' alias is for orders they PLACED (Buyer).
                    // Let's also try to include books they are selling.
                    { model: Book, as: 'books' } // Books they are selling
                ]
            });
            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
            return NextResponse.json(user);
        }

        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error('Admin users fetch error:', error);
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
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent deleting self (current admin) - optional but good practice
        const session = await getServerSession(authOptions);
        if (session.user.email === user.email) {
            return NextResponse.json({ error: 'Cannot delete your own admin account' }, { status: 403 });
        }

        // Setup cascade delete logic manually if Sequelize doesn't handle it for SQLite nicely
        // Often simpler to just destroy the user and let DB constraints fail or succeed
        // But for completeness, let's destroy the user.
        await user.destroy();

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Admin user delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
