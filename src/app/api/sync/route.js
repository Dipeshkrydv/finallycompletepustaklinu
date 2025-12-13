import { NextResponse } from 'next/server';
import sequelize from '@/lib/db';
import '@/models/index'; // Ensure models are loaded

export async function GET() {
  try {
    await sequelize.sync({ alter: true });
    return NextResponse.json({ message: 'Database synced successfully' });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync database' }, { status: 500 });
  }
}
