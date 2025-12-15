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
      // Improved Tag & Search Algorithm
      const lowerQuery = query.toLowerCase().trim();
      const tokens = lowerQuery.split(/\s+/).filter(Boolean);

      if (tokens.length > 0) {
        // We want to prioritize books that match the query in the 'keywords' (tags) field.
        // Or if the title matches well.

        // This 'OR' condition finds books where ANY token matches ANY of the fields.
        const searchConditions = tokens.map(token => ({
          [Op.or]: [
            { title: { [Op.like]: `%${token}%` } },
            { description: { [Op.like]: `%${token}%` } },
            { keywords: { [Op.like]: `%${token}%` } }, // Searching within tags
            { category: { [Op.like]: `%${token}%` } }
          ]
        }));

        // Combining with AND ensures that if user types "Biology 11", books having both implied concepts are found.
        // However, for tags like "Class 11", "Biology", sometimes we want matches for either.
        // Let's stick to the AND for tokens to narrow down results (Precision), 
        // but rely on partial field matches (Op.like) for Recall.
        whereClause = {
          [Op.and]: searchConditions
        };
      }
    }
    if (category) {
      whereClause.category = category;
    }

    // Show available, on-hold (booked), and sold books so users can see status
    whereClause.status = { [Op.in]: ['available', 'on-hold', 'sold'] };

    // Geolocation Search
    let include = [{ model: User, as: 'seller', attributes: ['name', 'latitude', 'longitude', 'city', 'state'] }];
    // Basic ordering by newest first
    let order = [['createdAt', 'DESC']];

    const books = await Book.findAll({
      where: whereClause,
      include: include,
      order: order,
    });

    let results = books.map(book => book.toJSON());

    // Post-processing for better "Tag Algorithm" ranking if a query exists
    // If we have a query, we might want to boost exact tag matches to the top.
    if (query) {
      const lowerQuery = query.toLowerCase().trim();
      results.sort((a, b) => {
        const aKeywords = (a.keywords || '').toLowerCase();
        const bKeywords = (b.keywords || '').toLowerCase();

        // Check for exact tag match presence
        // Assuming tags are comma separated
        const aTags = aKeywords.split(',').map(s => s.trim());
        const bTags = bKeywords.split(',').map(s => s.trim());

        // Boost if query matches one of the tags exactly
        const aHasTag = aTags.includes(lowerQuery);
        const bHasTag = bTags.includes(lowerQuery);

        if (aHasTag && !bHasTag) return -1;
        if (!aHasTag && bHasTag) return 1;

        // Secondary sort: Match in title?
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        if (aTitle.includes(lowerQuery) && !bTitle.includes(lowerQuery)) return -1;
        if (!aTitle.includes(lowerQuery) && bTitle.includes(lowerQuery)) return 1;

        return 0;
      });
    }

    // Distance Calculation & Sorting
    if (lat && lng) {
      results = results.map(book => {
        const seller = book.seller;
        if (seller && seller.latitude && seller.longitude) {
          const dist = getDistanceFromLatLonInKm(lat, lng, seller.latitude, seller.longitude);
          return { ...book, distance: dist };
        }
        return { ...book, distance: null };
      }).sort((a, b) => {
        // If query sorting already happened, we might want to keep that primary or secondary?
        // Usually, relevance (query) is more important than distance if the user is searching for something specific.
        // But if just browsing nearby, distance is key.
        // If `query` is present, let's prioritize relevance (preserved by stable sort or previous step), 
        // then distance.
        // If sorting strictly by distance is desired, uncomment standard sort.
        // For "algorithm like YouTube", relevance is key.

        // If distance is null (unknown location), push to bottom
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

    // Explicit Type Conversion & Validation
    const pages = parseInt(formData.get('pages') || '0', 10);
    const price = parseFloat(formData.get('price') || '0');
    const description = formData.get('description');
    const category = formData.get('category');
    const keywords = formData.get('keywords');
    const discount = parseInt(formData.get('discount') || '0', 10);

    const images = formData.getAll('images'); // Array of files

    if (!title || isNaN(pages) || isNaN(price) || !description || !category) {
      console.error('Validation failed:', { title, pages, price, category });
      return NextResponse.json({ error: 'Missing required fields or invalid number format' }, { status: 400 });
    }

    // Validate images exist (at least one) if creating new
    // Note: Edit might differ, but this is POST (Create).
    if (images.length === 0 && (!formData.get('imageOrder') || formData.get('imageOrder') === '[]')) {
      // Optional: enforce at least one image?
      // return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
    }

    const imageOrderRaw = formData.get('imageOrder');
    let imageOrder = [];
    if (imageOrderRaw) {
      try {
        imageOrder = JSON.parse(imageOrderRaw);
      } catch (e) {
        console.warn('Failed to parse imageOrder:', e);
        imageOrder = [];
      }
    }

    const newImagePaths = [];
    for (const image of images) {
      if (image && typeof image.arrayBuffer === 'function' && image.name) {
        try {
          const buffer = Buffer.from(await image.arrayBuffer());
          // Sanitize filename
          const safeName = image.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filename = Date.now() + '-' + safeName;
          const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
          await mkdir(path.dirname(uploadPath), { recursive: true });
          await writeFile(uploadPath, buffer);
          newImagePaths.push(`/uploads/${filename}`);
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          // Continue or fail? Let's continue but log.
        }
      }
    }

    // Construct final images list
    let finalImages = [];
    if (imageOrder.length > 0) {
      let newImgIdx = 0;
      finalImages = imageOrder.map(item => {
        if (item === 'new-image-placeholder') {
          return newImagePaths[newImgIdx++] || null;
        }
        return item;
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
      keywords, // Tags
      discount,
      images: finalImages, // Sequelize handling JSON/array
      sellerId: session.user.id,
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error('Books POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371.0710; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}
