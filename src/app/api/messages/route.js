
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Message, User } from '@/models/index';
import { Op } from 'sequelize';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(req.url);
        const otherUserId = searchParams.get('userId');

        if (session.user.role === 'admin') {
            if (!otherUserId) {
                // Return list of unique users who have conversations
                // fetching all messages is expensive, let's try to get unique sender/receivers
                // In SQLite/Sequelize simple distinct on columns complex.
                // Naive approach: Fetch all messages, group by other party in JS. Slower but works for MVP.
                const messages = await Message.findAll({
                    include: [
                        { model: User, as: 'sender', attributes: ['id', 'name', 'role', 'email'] },
                        { model: User, as: 'receiver', attributes: ['id', 'name', 'role', 'email'] }
                    ],
                    order: [['createdAt', 'DESC']]
                });

                const conversations = new Map();
                messages.forEach(msg => {
                    const other = msg.senderId === userId ? msg.receiver : msg.sender;
                    // For admin, mostly other is the user. But if admin talks to admin (rare), logic holds.
                    // Actually, if sender is NOT me (admin), then sender is the user.
                    // If sender IS me, receiver is the user.
                    // Be careful with nulls if user deleted.
                    if (!other) return;

                    if (!conversations.has(other.id)) {
                        conversations.set(other.id, {
                            user: other,
                            lastMessage: msg
                        });
                    }
                });

                return NextResponse.json(Array.from(conversations.values()));
            }

            // Valid otherUserId, fetch chat history
            const whereClause = {
                [Op.or]: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            };
            const messages = await Message.findAll({
                where: whereClause,
                order: [['createdAt', 'ASC']],
                include: [
                    { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
                    { model: User, as: 'receiver', attributes: ['id', 'name', 'role'] }
                ]
            });
            return NextResponse.json(messages);
        } else {
            // Standard User Logic (View chat with Admin)
            // ... (keep existing logic or simplified)
            const whereClause = {
                [Op.or]: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            };
            const messages = await Message.findAll({
                where: whereClause,
                order: [['createdAt', 'ASC']],
                include: [
                    { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
                    { model: User, as: 'receiver', attributes: ['id', 'name', 'role'] }
                ]
            });
            return NextResponse.json(messages);
        }
    } catch (error) {
        console.error('Messages GET Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, receiverId } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // specific logic:
        // If Buyer sends, receiverId might be 'admin' (if we handle that) or specific ID.
        // If Admin sends, receiverId is the buyer.

        let targetReceiverId = receiverId;

        if (!targetReceiverId) {
            // If buyer sending and didn't specify, maybe send to first admin?
            // Let's require receiverId for now to be safe.
            // Or find an admin.
            if (session.user.role !== 'admin') {
                const admin = await User.findOne({ where: { role: 'admin' } });
                if (admin) targetReceiverId = admin.id;
                else return NextResponse.json({ error: 'No admin found to messsage' }, { status: 404 });
            } else {
                return NextResponse.json({ error: 'Receiver ID required' }, { status: 400 });
            }
        }

        const newMessage = await Message.create({
            content,
            senderId: session.user.id,
            receiverId: targetReceiverId,
        });

        return NextResponse.json(newMessage);
    } catch (error) {
        console.error('Messages POST Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
