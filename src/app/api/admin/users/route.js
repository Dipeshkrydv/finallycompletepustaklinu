import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { User, Book, Order, Cart, Message } from '@/models/index'; // Import related models for cascade delete if not handled by DB
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        const role = searchParams.get('role');
        const whereClause = {};
        if (role) {
            whereClause.role = role;
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        return NextResponse.json({
            users: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
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

        // Manual Cascade Delete to ensure clean removal
        // 1. Delete user's Cart
        await Cart.destroy({ where: { buyerId: user.id } });

        // 2. Delete Messages (sent and received)
        await Message.destroy({ where: { senderId: user.id } });
        await Message.destroy({ where: { receiverId: user.id } });

        // 3. Delete Books listed by user
        await Book.destroy({ where: { sellerId: user.id } });

        // 4. Handle Orders (Optional: Delete or Anonymize? Deleting for clean slate)
        // Deleting orders where user is buyer
        await Order.destroy({ where: { buyerId: user.id } });
        // NOTE: Orders where user is seller are linked to Books, mostly handled by Book deletion if cascaded there, 
        // but explicit check is safer.
        // await Order.destroy({ where: { sellerId: user.id } }); // Not directly linked in some schemas, relying on book link.

        // 5. Finally, destroy Users
        await user.destroy();

        return NextResponse.json({ message: 'User and all related data deleted successfully' });
    } catch (error) {
        console.error('Admin user delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
