import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin } from 'lucide-react'

// This would typically come from a database
const myListings = [
  { id: 1, name: 'Mountain Bike', price: 25, image: '/placeholder.svg?height=200&width=300', rating: 4.5, location: 'Denver, CO', priceType: 'day' },
  { id: 2, name: 'Camping Tent', price: 30, image: '/placeholder.svg?height=200&width=300', rating: 4.2, location: 'Portland, OR', priceType: 'day' },
  { id: 3, name: 'Surfboard', price: 35, image: '/placeholder.svg?height=200&width=300', rating: 4.7, location: 'Los Angeles, CA', priceType: 'day' },
]

export default function MyListingsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Listings</CardTitle>
        <Button asChild>
          <Link href="/listings/new">Add New Listing</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Image src={listing.image} alt={listing.name} width={300} height={200} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{listing.name}</h3>
                <p className="text-gray-600 mb-2">${listing.price}/{listing.priceType}</p>
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1">{listing.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {listing.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

