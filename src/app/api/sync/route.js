import { NextResponse } from 'next/server';
import sequelize from '@/lib/db';
import '@/models/index'; // Ensure models are loaded

import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await sequelize.sync({ alter: true });
    return NextResponse.json({ message: 'Database synced successfully' });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync database' }, { status: 500 });
  }
}
