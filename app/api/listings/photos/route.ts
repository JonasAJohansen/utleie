import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const listingId = formData.get('listingId') as string;
    const description = formData.get('description') as string || '';
    const isMain = formData.get('isMain') === 'true';

    if (!file || !listingId) {
      return NextResponse.json(
        { error: 'File and listingId are required' },
        { status: 400 }
      );
    }

    // Validate that the listing belongs to the current user
    const listingResult = await sql`
      SELECT id FROM listings 
      WHERE id = ${listingId} AND user_id = ${userId}
    `;

    if (listingResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'Listing not found or does not belong to current user' },
        { status: 404 }
      );
    }

    // Get next display order for this listing
    const displayOrderResult = await sql`
      SELECT COALESCE(MAX(display_order), -1) + 1 as next_order
      FROM listing_photos
      WHERE listing_id = ${listingId}
    `;
    
    const displayOrder = displayOrderResult.rows[0].next_order || 0;
    
    // Check if we've reached the maximum photos limit (4)
    if (displayOrder >= 4) {
      return NextResponse.json(
        { error: 'Maximum of 4 photos per listing allowed' },
        { status: 400 }
      );
    }

    // Upload to blob storage
    const filename = `${uuidv4()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
    });

    // Store the photo info in database
    const result = await sql`
      INSERT INTO listing_photos (
        id, 
        listing_id, 
        url, 
        description,
        is_main,
        display_order
      ) 
      VALUES (
        ${uuidv4()}, 
        ${listingId}, 
        ${blob.url}, 
        ${description},
        ${isMain},
        ${displayOrder}
      )
      RETURNING id, url, description, is_main as "isMain", display_order as "displayOrder"
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo', details: (error as Error).message },
      { status: 500 }
    );
  }
} 