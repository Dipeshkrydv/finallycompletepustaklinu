import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { Op } from 'sequelize';
import sequelize from '@/lib/db';
import { Book, User } from '@/models/index';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const query = searchParams.get('q');
    const category = searchParams.get('category');

    let whereClause = {};
    if (query) {
      whereClause = {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
          { keywords: { [Op.like]: `%${query}%` } },
        ],
      };
    }
    if (category) {
      whereClause.category = category;
    }

    // Geolocation Search
    let include = [{ model: User, as: 'seller', attributes: ['name', 'latitude', 'longitude', 'city', 'state'] }];
    let order = [['createdAt', 'DESC']];

    if (lat && lng) {
      // Haversine formula for distance in km
      const haversine = `(
        6371 * acos(
          cos(radians(${lat}))
          * cos(radians(latitude))
          * cos(radians(longitude) - radians(${lng}))
          + sin(radians(${lat})) * sin(radians(latitude))
        )
      )`;

      // We need to order by distance.
      // Since 'distance' is calculated on the associated User model, it's tricky in Sequelize with standard include.
      // We might need a raw query or a subquery, but for simplicity, let's fetch all (or filtered) and sort in JS if dataset is small,
      // OR use a literal in the order clause if possible.
      // However, sorting by associated column calculated value is complex.
      // Let's try to add the distance attribute to the query.

      // Simpler approach: Filter by city/state if provided in query, otherwise show all.
      // But user asked for "near him".
      // Let's just return all books with seller info and let frontend sort/filter, OR do a raw query.
      // Given the constraints, I'll stick to basic filtering for now and maybe add distance sorting if time permits or use a raw query.

      // Let's try to use Sequelize literal for distance in attributes.
    }

    const books = await Book.findAll({
      where: whereClause,
      include: include,
      order: order,
    });

    // Post-processing for distance if lat/lng provided
    let results = books.map(book => book.toJSON());
    if (lat && lng) {
      results = results.map(book => {
        const seller = book.seller;
        if (seller && seller.latitude && seller.longitude) {
          const dist = getDistanceFromLatLonInKm(lat, lng, seller.latitude, seller.longitude);
          return { ...book, distance: dist };
        }
        return { ...book, distance: null };
      }).sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Books GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'seller' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title');
    const pages = formData.get('pages');
    const price = formData.get('price');
    const description = formData.get('description');
    const category = formData.get('category');
    const keywords = formData.get('keywords');
    const discount = formData.get('discount') || 0;
    console.log('DEBUG BOOK CREATE - Discount received:', discount);
    const images = formData.getAll('images'); // Array of files

    if (!title || !pages || !price || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const imageOrderRaw = formData.get('imageOrder');
    let imageOrder = [];
    if (imageOrderRaw) {
      try {
        imageOrder = JSON.parse(imageOrderRaw);
      } catch (e) {
        imageOrder = [];
      }
    }

    const newImagePaths = [];
    for (const image of images) {
      if (image && typeof image.arrayBuffer === 'function' && image.name) {
        const buffer = Buffer.from(await image.arrayBuffer());
        const filename = Date.now() + '-' + image.name.replace(/\s/g, '-');
        const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
        await mkdir(path.dirname(uploadPath), { recursive: true });
        await writeFile(uploadPath, buffer);
        newImagePaths.push(`/uploads/${filename}`);
      }
    }

    // Construct final images list based on order
    let finalImages = [];
    if (imageOrder.length > 0) {
      let newImgIdx = 0;
      finalImages = imageOrder.map(item => {
        if (item === 'new-image-placeholder') {
          return newImagePaths[newImgIdx++] || null;
        }
        return item; // Should be null for POST usually, unless we support copying? For POST it's mostly new.
        // Actually for POST, if we only have new images, imageOrder might be ['new-image-placeholder', 'new-image-placeholder']
        // But wait, the frontend might send 'new-123' IDs.
        // Let's stick to the plan: Frontend sends 'new-image-placeholder' for new files in order.
      }).filter(Boolean);
    } else {
      finalImages = newImagePaths;
    }

    const newBook = await Book.create({
      title,
      pages,
      price,
      description,
      category,
      keywords,
      discount,
      images: finalImages,
      sellerId: session.user.id, // Admin can add books? User said "Admin can also updaet,delete and update all books of seller". Usually Admin manages. If Admin adds, who is seller? 
      // Assuming Admin adds for themselves or we need a sellerId param.
      // For now, assume logged in user is the seller.
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error('Books POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371.0710; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);  // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}
