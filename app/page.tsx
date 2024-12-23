import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, MapPin } from 'lucide-react'
import { sql } from '@vercel/postgres'

async function getLatestListings() {
  try {
    const result = await sql`
      SELECT l.*, u.username
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

export default async function Home() {
  const latestListings = await getLatestListings()

  return (
    <div className="space-y-16">
      <section className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-24 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-6 leading-tight">Discover, Rent, and Experience</h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto">Find unique items to rent for your next adventure, project, or special occasion. Join our community of sharers today!</p>
          <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-indigo-100">
            <Link href="/listings">Browse Listings</Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8">Latest Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={listing.image || '/placeholder.svg?height=200&width=300'}
                  alt={listing.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{listing.name}</h3>
                <p className="text-gray-600 mb-2">${listing.price}/day</p>
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm">{listing.rating ? listing.rating.toFixed(1) : 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{listing.location || 'Location not specified'}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Listed by {listing.username}</p>
                <Button asChild className="w-full mt-4">
                  <Link href={`/listings/${listing.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/listings">View All Listings</Link>
          </Button>
        </div>
      </section>

      <section className="bg-gray-100 py-16 rounded-lg">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find an Item</h3>
              <p className="text-gray-600">Browse our wide selection of items available for rent in your area.</p>
            </div>
            <div>
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book It</h3>
              <p className="text-gray-600">Choose your rental dates and book the item with our secure platform.</p>
            </div>
            <div>
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy & Return</h3>
              <p className="text-gray-600">Pick up the item, enjoy your rental, and return it when you're done.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Renting?</h2>
          <p className="text-xl mb-8">Join our community today and start discovering amazing items to rent.</p>
          <Button asChild size="lg">
            <Link href="/sign-up">Sign Up Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
