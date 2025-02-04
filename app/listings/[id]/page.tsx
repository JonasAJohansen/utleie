import { notFound, redirect } from 'next/navigation'
import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import ListingGallery from './ListingGallery'
import { ListingDetails } from './ListingDetails'
import { QueryResultRow } from '@vercel/postgres'

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
}

interface PageProps {
  params: Promise<any> | undefined
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
        u.username,
        u.image_url as user_image,
        COALESCE(AVG(r.rating)::numeric, 0)::numeric(10,2) as rating,
        COUNT(r.id) as review_count
      FROM listings l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN reviews r ON l.id = r.listing_id
      WHERE l.id = ${id}::uuid
      GROUP BY l.id, l.name, l.description, l.price, l.location, l.user_id, l.status, l.created_at, l.condition, u.username, u.image_url
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

export default async function ItemListing({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const { userId } = await auth()

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
    condition: item.condition
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ListingGallery photos={item.photos} />
        <ListingDetails item={listingDetails} userId={userId || null} isFavorited={isFavorited} />
      </div>
    </div>
  )
}

