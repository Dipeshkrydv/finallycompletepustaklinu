import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { User } from '@/models/index';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, password, role, address, city, state, pincode, latitude, longitude, province } = body;

    if (!name || !email || !phone || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
    console.log('User created:', newUser.toJSON());

    return NextResponse.json({ message: 'User created successfully', user: { id: newUser.id, name: newUser.name, role: newUser.role } }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
