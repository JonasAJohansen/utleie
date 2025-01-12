import { sql } from '@vercel/postgres'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin } from 'lucide-react'
import { FilterBar } from '@/components/FilterBar'

export const dynamic = 'force-dynamic'

interface CategoryParams {
  id: string
  minPrice?: string
  maxPrice?: string
  location?: string
  sortBy?: string
  rating?: string
}

interface PageProps {
  params: Promise<any> | undefined
  searchParams: Promise<any> | undefined
}

async function getCategoryListings({ id, ...params }: CategoryParams) {
  const values: any[] = [id]
  let paramIndex = 1

  try {
    let whereConditions = `l.category_id = $1::uuid`

    if (params.minPrice) {
      paramIndex++
      whereConditions += ` AND l.price >= $${paramIndex}`
      values.push(params.minPrice)
    }
    if (params.maxPrice) {
      paramIndex++
      whereConditions += ` AND l.price <= $${paramIndex}`
      values.push(params.maxPrice)
    }
    if (params.location) {
      paramIndex++
      whereConditions += ` AND l.location ILIKE $${paramIndex}`
      values.push(`%${params.location}%`)
    }

    let groupByClause = 'GROUP BY l.id, u.username, u.image_url, c.name'
    if (params.rating) {
      paramIndex++
      groupByClause += ` HAVING COALESCE(AVG(r.rating), 0) >= $${paramIndex}`
      values.push(params.rating)
    }

    let orderByClause = ''
    switch (params.sortBy) {
      case 'price_low':
        orderByClause = 'l.price ASC'
        break
      case 'price_high':
        orderByClause = 'l.price DESC'
        break
      case 'rating':
        orderByClause = 'avg_rating DESC, review_count DESC'
        break
      default:
        orderByClause = 'l.created_at DESC'
    }

    const query = `
      SELECT 
        l.*,
        u.username,
        c.name as category_name,
        COALESCE(
          (
            SELECT lp.url
            FROM listing_photos lp
            WHERE lp.listing_id = l.id AND lp.is_main = true
            LIMIT 1
          ),
          (
            SELECT lp.url
            FROM listing_photos lp
            WHERE lp.listing_id = l.id
            ORDER BY lp.display_order
            LIMIT 1
          )
        ) as image
      FROM listings l
      JOIN users u ON l.user_id = u.id
      JOIN categories c ON l.category_id::uuid = c.id::uuid
      WHERE l.category_id::uuid = $1::uuid
      ORDER BY l.created_at DESC
    `

    const result = await sql.query(query, values)
    return {
      listings: result.rows,
      categoryName: result.rows[0]?.category_name || 'Category'
    }
  } catch (error) {
    console.error('Database Error:', error)
    return { listings: [], categoryName: 'Category' }
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const resolvedSearchParams = await Promise.resolve(searchParams)

  const { listings, categoryName } = await getCategoryListings({ 
    id: resolvedParams?.id,
    ...(resolvedSearchParams || {})
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{categoryName}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <FilterBar />
        </aside>

        <main className="md:col-span-3">
          <div className="mb-6">
            <p className="text-gray-600">
              {listings.length} {listings.length === 1 ? 'listing' : 'listings'} available
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Link href={`/listings/${listing.id}`} key={listing.id} className="block">
                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                  <div className="relative h-48">
                    <Image
                      src={listing.image || '/placeholder.svg?height=200&width=300'}
                      alt={listing.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{listing.name}</h3>
                    <p className="text-gray-600 mb-2">${listing.price}/day</p>
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1">
                        {listing.avg_rating ? listing.avg_rating.toFixed(1) : 'N/A'}
                        {listing.review_count > 0 && ` (${listing.review_count})`}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{listing.location || 'Location not specified'}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Listed by {listing.username}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {listings.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No listings found</h2>
              <p className="text-gray-600">
                We couldn't find any listings matching your criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

