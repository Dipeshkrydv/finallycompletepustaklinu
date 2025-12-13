import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { User } from '@/models/index';
import bcrypt from 'bcrypt';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findOne({
            where: { email: session.user.email },
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, phone, address, city, state, province, pincode, currentPassword, newPassword, role } = body;

        const user = await User.findOne({ where: { email: session.user.email } });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prepare update data
        const updateData = {
            name,
            phone,
            role: (role === 'admin' ? user.role : (role || user.role)), // Prevent setting role to admin via API if not already admin
            address,
            city,
            state,
            province,
            pincode
        };

        // Handle password change if requested
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
            }

            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        await user.update(updateData);

        return NextResponse.json({ message: 'Profile updated successfully', user: { ...user.toJSON(), password: undefined } });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
