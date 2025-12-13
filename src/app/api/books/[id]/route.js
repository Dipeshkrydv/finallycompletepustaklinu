import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Book } from '@/models/index';
import { authOptions } from '../../auth/[...nextauth]/route';

import { writeFile } from 'fs/promises';
import path from 'path';

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'seller' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const book = await Book.findByPk(id);

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Check ownership if seller
    if (session.user.role === 'seller' && book.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await req.formData();
    const title = formData.get('title');
    const pages = formData.get('pages');
    const price = formData.get('price');
    const description = formData.get('description');
    const category = formData.get('category');
    const images = formData.getAll('images'); // Array of files

    const updateData = {
      title,
      pages,
      price,
      description,
      category,
      keywords: formData.get('keywords'),
      discount: formData.get('discount') || 0,
    };

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
    // Handle new images if provided
    if (images && images.length > 0 && images[0] instanceof File) {
      for (const image of images) {
        const buffer = Buffer.from(await image.arrayBuffer());
        const filename = Date.now() + '-' + image.name.replace(/\s/g, '-');
        const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
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
        return item; // Existing URL
      }).filter(Boolean);
    } else {
      // Fallback if no order provided (shouldn't happen with updated frontend)
      // But for safety, merge existing + new
      const existingImagesRaw = formData.get('existingImages'); // Legacy support
      let existing = [];
      if (existingImagesRaw) {
        try { existing = JSON.parse(existingImagesRaw); } catch (e) { }
      }
      finalImages = [...existing, ...newImagePaths];
    }

    updateData.images = finalImages;

    await book.update(updateData);

    return NextResponse.json(book);
  } catch (error) {
    console.error('Book PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'seller' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const book = await Book.findByPk(id);

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Check ownership if seller
    if (session.user.role === 'seller' && book.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await book.destroy();

    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Book DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
