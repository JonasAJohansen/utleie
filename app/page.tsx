import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Star, MapPin, ArrowRight } from 'lucide-react'
import { sql } from '@vercel/postgres'
import { SearchBar } from '@/components/SearchBar'

async function getLatestListings() {
  try {
    const result = await sql`
      SELECT 
        l.*,
        u.username,
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
      ORDER BY l.created_at DESC
      LIMIT 4
    `
    return result.rows
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch latest listings')
  }
}

async function getPopularCategories() {
  try {
    const result = await sql`
      SELECT id, name, icon, description
      FROM categories
      WHERE is_popular = true
      ORDER BY name ASC
    `
    return result.rows
  } catch (error) {
    console.error('Database Error:', error)
    return []
  }
}

async function getFeaturedCategories() {
  try {
    const result = await sql`
      SELECT id, name, icon, description
      FROM categories
      WHERE is_featured = true
      ORDER BY name ASC
    `
    return result.rows
  } catch (error) {
    console.error('Database Error:', error)
    return []
  }
}

export default async function Home() {
  const [latestListings, popularCategories, featuredCategories] = await Promise.all([
    getLatestListings(),
    getPopularCategories(),
    getFeaturedCategories()
  ])

  return (
    <div className="space-y-16">
      <section className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-24 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-6 leading-tight">Discover, Rent, and Experience</h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto">Find unique items to rent for your next adventure, project, or special occasion. Join our community of sharers today!</p>
          <div className="mt-8">
            <SearchBar initialQuery="" />
          </div>
        </div>
      </section>

      {popularCategories.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Popular Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {popularCategories.map((category) => (
              <Link 
                key={category.id} 
                href={`/category/${category.id}`}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <span className="text-5xl mb-4">{category.icon}</span>
                <span className="text-sm font-medium text-center">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featuredCategories.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCategories.map((category) => (
              <Link 
                key={category.id}
                href={`/category/${category.id}`}
                className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600">
                  {category.icon && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-7xl">
                      {category.icon}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white text-2xl font-bold mb-2">{category.name}</h3>
                  {category.description && (
                    <p className="text-white text-sm">{category.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-3xl font-bold mb-8">Latest Listings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {latestListings.map((listing) => (
            <Link href={`/listings/${listing.id}`} key={listing.id} className="block">
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                <div className="relative h-48">
                  <Image
                    src={listing.image || '/placeholder.svg'}
                    alt={listing.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={true}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{listing.name}</h3>
                  <p className="text-gray-600 mb-2">${listing.price}/day</p>
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1">{listing.rating ? listing.rating.toFixed(1) : 'N/A'}</span>
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
        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/listings">View All Listings</Link>
          </Button>
        </div>
      </section>

      <section className="bg-gradient-to-r from-green-400 to-blue-500 text-white py-20 rounded-2xl">
        <div className="max-w-5xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white bg-opacity-20 p-8 rounded-xl">
              <div className="text-5xl mb-6">🔍</div>
              <h3 className="font-semibold text-2xl mb-4">1. Find an Item</h3>
              <p className="text-lg">Browse our extensive selection of items available for rent in your area.</p>
            </div>
            <div className="bg-white bg-opacity-20 p-8 rounded-xl">
              <div className="text-5xl mb-6">💬</div>
              <h3 className="font-semibold text-2xl mb-4">2. Request to Rent</h3>
              <p className="text-lg">Send a request to the owner and agree on rental terms and conditions.</p>
            </div>
            <div className="bg-white bg-opacity-20 p-8 rounded-xl">
              <div className="text-5xl mb-6">🎉</div>
              <h3 className="font-semibold text-2xl mb-4">3. Enjoy and Return</h3>
              <p className="text-lg">Use the item for your needs and return it in the agreed-upon condition.</p>
            </div>
          </div>
          <Button asChild className="mt-12 bg-white text-blue-600 hover:bg-blue-50" size="lg">
            <Link href="/listings">
              Start Renting Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Start Renting?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">Join our community today and start discovering amazing items to rent.</p>
        <Button asChild size="lg">
          <Link href="/sign-up">
            Sign Up Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>
    </div>
  )
}

