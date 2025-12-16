import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User, Otp } from '@/models/index';
import { Op } from 'sequelize';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, password, role, address, city, state, pincode, latitude, longitude, province, otp } = body;

    if (!name || !email || !phone || !password || !role || !otp) {
      return NextResponse.json({ error: 'Missing required fields (including OTP)' }, { status: 400 });
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({
      where: {
        email,
        otp,
        expiresAt: { [Op.gt]: new Date() } // Check if not expired
      }
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Please verify your email again.' }, { status: 400 });
    }

    const existingUserByPhone = await User.findOne({ where: { phone } });
    if (existingUserByPhone) {
      return NextResponse.json({ error: 'User already exists with this phone number' }, { status: 400 });
    }

    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    if (!['buyer', 'seller'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role selected' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      province,
    });


    // Delete used OTP
    await otpRecord.destroy();

    return NextResponse.json({ message: 'User created successfully', user: { id: newUser.id, name: newUser.name, role: newUser.role } }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
