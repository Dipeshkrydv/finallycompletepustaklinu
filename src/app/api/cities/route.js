import { NextResponse } from 'next/server';
import { User } from '@/models/index';

export async function GET() {
  try {
    const cities = await User.findAll({
      attributes: ['city'],
      where: { role: 'seller' },
      group: ['city'],
    });

    const uniqueCities = cities.map(u => u.city).filter(Boolean);

    // Add popular Nepal districts
    const popularDistricts = [
      'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan',
      'Biratnagar', 'Dharan', 'Birgunj', 'Butwal', 'Hetauda',
      'Nepalgunj', 'Dhangadhi', 'Itahari', 'Janakpur', 'Ghorahi',
      'Tulsipur', 'Birendranagar', 'Kalaiya', 'Jitpur Simara', 'Mechinagar'
    ];

    // Merge and unique
    const allLocations = [...new Set([...uniqueCities, ...popularDistricts])].sort();

    return NextResponse.json(allLocations, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Cities fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
