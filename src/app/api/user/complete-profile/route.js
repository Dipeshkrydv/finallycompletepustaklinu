import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { User } from '@/models/index';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { role, phone, city, state, province, address, pincode, latitude, longitude } = await req.json();

        if (!role || !['buyer', 'seller'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role selected' }, { status: 400 });
        }

        if (!phone || phone.length < 10) {
            return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 });
        }

        if (!latitude || !longitude) {
            return NextResponse.json({ error: 'Location coordinates are required' }, { status: 400 });
        }

        // Update user
        const dbUser = await User.findOne({ where: { email: session.user.email } });

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        dbUser.role = role;
        dbUser.phone = phone;
        dbUser.city = city;
        dbUser.latitude = latitude;
        dbUser.longitude = longitude;

        // Optional based on role
        if (state) dbUser.state = state;
        if (province) dbUser.province = province;
        if (address) dbUser.address = address;
        if (pincode) dbUser.pincode = pincode;

        await dbUser.save();

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                role: dbUser.role,
                phone: dbUser.phone
            }
        });

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return NextResponse.json({ error: 'This phone number is already registered with another account.' }, { status: 400 });
        }
        console.error('Error completing profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
