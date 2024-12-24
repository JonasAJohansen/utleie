'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin } from 'lucide-react'

interface Listing {
  id: string
  name: string
  price: number
  image: string
  rating: number | null
  location: string
  created_at: string
}

export default function MyListingsPage() {
  const { user } = useUser()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchListings() {
      if (!user) return

      try {
        const response = await fetch(`/api/listings?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setListings(data)
        }
      } catch (error) {
        console.error('Error fetching listings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchListings()
  }, [user])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Listings</CardTitle>
        <Button asChild>
          <Link href="/listings/new">Add New Listing</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">You haven't created any listings yet.</p>
            <Button asChild>
              <Link href="/listings/new">Create Your First Listing</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Image 
                  src={listing.image || '/placeholder.svg?height=200&width=300'} 
                  alt={listing.name} 
                  width={300} 
                  height={200} 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{listing.name}</h3>
                  <p className="text-gray-600 mb-2">${listing.price}/day</p>
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1">
                      {typeof listing.rating === 'number' ? listing.rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.location || 'Location not specified'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

