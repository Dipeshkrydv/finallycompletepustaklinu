import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
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
        // Handle password change if requested
        if (newPassword) {
            // If user has a password (email/pass login), verify it
            if (user.password) {
                if (!currentPassword) {
                    return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
                }
                const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
                if (!isPasswordValid) {
                    return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
                }
            } else {
                // User has no password (e.g. Google Login). 
                // We can either allow setting it directly OR require them to use a "Set Password" flow.
                // For now, if they are providing newPassword, we assume they want to set it.
                // BUT strict security might imply we shouldn't let them just set it without re-auth.
                // However, since they are logged in (session valid), it's generally OK to "Add Password".
                // But wait, the frontend might demand currentPassword.
                // If currentPassword IS provided but user.password is null, comparing fails.
                // So we just skip comparison if user.password is null.
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
