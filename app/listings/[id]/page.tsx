import { notFound, redirect } from 'next/navigation'
import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import ListingGallery from './ListingGallery'
import { ListingDetails } from './ListingDetails'
import { QueryResultRow } from '@vercel/postgres'
import { SimilarListings } from '@/components/listings/SimilarListings'
import { AvailabilityCalendar } from '@/components/listings/AvailabilityCalendar'
import { ListingSchema } from '@/components/listings/ListingSchema'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ListingPageClient } from './ListingPageClient'
import { Metadata, ResolvingMetadata } from 'next'

interface ListingPhoto {
  id: string
  url: string
  description: string
  isMain: boolean
  displayOrder: number
}

interface ListingData extends QueryResultRow {
  id: string
  name: string
  description: string
  price: number
  rating: number
  review_count: number
  location: string | null
  user_id: string
  username: string
  user_image: string | null
  photos: ListingPhoto[]
  condition: string | null
  category_name?: string
  category_id?: string
  available_from?: string
  available_to?: string
  security_deposit?: number
  min_rental_days?: number
}

interface PageProps {
  params: Promise<{ id: string }>
}

async function getListingData(id: string): Promise<ListingData | null> {
  try {
    // First, get the listing photos
    const photosResult = await sql`
      SELECT 
        id,
        url,
        description,
        is_main as "isMain",
        display_order as "displayOrder"
      FROM listing_photos
      WHERE listing_id = ${id}::uuid
      ORDER BY display_order
    `

    // Then get the listing details
    const result = await sql`
      SELECT 
        l.id,
        l.name,
        l.description,
        l.price::numeric as price,
        l.location,
        l.user_id,
        l.status,
        l.created_at,
        l.condition,
        l.category_id,
        l.available_from,
        l.available_to,
        l.security_deposit,
        l.min_rental_days,
        c.name as category_name,
        u.username,
        u.image_url as user_image,
        COALESCE(AVG(r.rating)::numeric, 0)::numeric(10,2) as rating,
        COUNT(r.id) as review_count
      FROM listings l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN categories c ON l.category_id = c.id::text
      LEFT JOIN reviews r ON l.id = r.listing_id
      WHERE l.id = ${id}::uuid
      GROUP BY l.id, l.name, l.description, l.price, l.location, l.user_id, l.status, l.created_at, l.condition, l.category_id, l.available_from, l.available_to, l.security_deposit, l.min_rental_days, c.name, u.username, u.image_url
    `

    if (result.rows.length === 0) {
      return null
    }

    // Combine the listing data with photos
    return {
      ...result.rows[0],
      photos: photosResult.rows as ListingPhoto[]
    } as ListingData
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch listing')
  }
}

async function checkIsFavorited(listingId: string, userId: string) {
  const result = await sql`
    SELECT id FROM favorites
    WHERE listing_id = ${listingId} AND user_id = ${userId}
  `
  return result.rows.length > 0
}

// Generate metadata
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const result = await sql`
      SELECT name, description
      FROM listings
      WHERE id = ${id}
    `;
    
    if (!result.rows.length) {
      return {
        title: 'Annonse ikke funnet',
        description: 'Annonsen du leter etter finnes ikke eller har blitt fjernet.'
      };
    }
    
    const { name, description } = result.rows[0];
    
    return {
      title: name || 'Produkt til leie',
      description: description?.substring(0, 160) || 'Se detaljer om dette produktet til leie på Price Tag.'
    };
  } catch (error) {
    console.error('Error fetching listing metadata:', error);
    return {
      title: 'Produkt til leie',
      description: 'Se detaljer om dette produktet til leie på Price Tag.'
    };
  }
}

export default async function ItemListing({ params }: PageProps) {
  const { userId } = await auth()
  
  // Await params before accessing its properties
  const resolvedParams = await params
  
  if (!resolvedParams?.id) {
    notFound()
  }

  const item = await getListingData(resolvedParams.id)

  if (!item) {
    notFound()
  }

  const isFavorited = userId ? await checkIsFavorited(resolvedParams.id, userId) : false

  const listingDetails = {
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    rating: Number(item.rating),
    review_count: Number(item.review_count),
    location: item.location,
    user_id: item.user_id,
    username: item.username,
    user_image: item.user_image,
    condition: item.condition || undefined
  }

  // Create images array for schema
  const imageUrls = item.photos.map(photo => photo.url)
  const mainImageUrl = item.photos.find(p => p.isMain)?.url || item.photos[0]?.url

  // Prepare listing data for the client component
  const listingData = {
    ...listingDetails,
    photos: item.photos,
    userId: userId || null,
    isFavorited,
    mainImageUrl,
    imageUrls,
    categoryId: item.category_id || '',
    categoryName: item.category_name,
    availableFrom: item.available_from || new Date().toISOString(),
    availableTo: item.available_to || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    securityDeposit: item.security_deposit ? Number(item.security_deposit) : undefined,
    minRentalDays: item.min_rental_days ? Number(item.min_rental_days) : undefined
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Structured data for SEO */}
      <ListingSchema
        item={{
          ...listingDetails,
          userId: item.user_id,
          mainImage: mainImageUrl,
          images: imageUrls,
          categoryName: item.category_name,
          reviewCount: item.review_count,
        }}
        url={`${process.env.NEXT_PUBLIC_APP_URL || 'https://pricetag.no'}/listings/${item.id}`}
      />

      {/* Use a client component to handle the UI with animations */}
      <ListingPageClient listingData={listingData} />
    </div>
  )
}