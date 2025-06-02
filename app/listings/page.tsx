'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchBar } from '@/components/SearchBar'
import { SearchFilters } from '@/components/SearchFilters'
import { FilterBar } from '@/components/FilterBar'
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin } from 'lucide-react'

interface Listing {
  id: string
  name: string
  price: number
  image_url?: string
  rating: number | null
  review_count: number
  location: string
  username: string
  user_image?: string
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchListings()
  }, [searchParams])

  const fetchListings = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams(searchParams.toString())
      const response = await fetch(`/api/listings?${params.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        setListings(Array.isArray(data.listings) ? data.listings : data)
        setTotalCount(data.total || data.length || 0)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (filters: any) => {
    // This would update the URL params and trigger a refetch
    fetchListings()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">All Listings</h1>
        <SearchBar />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <FilterBar onFilterChange={handleFilterChange} />
        </aside>

        <main className="md:col-span-3">
          <div className="mb-6">
            <p className="text-gray-600">
              {isLoading ? 'Loading...' : `${totalCount} ${totalCount === 1 ? 'listing' : 'listings'} available`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(9).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Link href={`/listings/${listing.id}`} key={listing.id} className="block">
                  <Card className="overflow-hidden transition-transform hover:scale-105">
                    <div className="relative h-48">
                      <Image
                        src={listing.image_url || '/placeholder.svg?height=200&width=300'}
                        alt={listing.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{listing.name}</h3>
                      <p className="text-gray-600 mb-2">{listing.price} kr/day</p>
                      <div className="flex items-center mb-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-1">
                          {listing.rating ? `${listing.rating.toFixed(1)} (${listing.review_count})` : 'No reviews yet'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{listing.location || 'Location not specified'}</span>
                      </div>
                      <p className="text-sm text-gray-500">Listed by {listing.username}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && listings.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No listings found</h2>
              <p className="text-gray-600 mb-4">
                We couldn't find any listings matching your criteria. Try adjusting your filters.
              </p>
              <Link 
                href="/listings/new"
                className="inline-block bg-[#4CD964] text-white px-6 py-3 rounded-lg hover:bg-[#3CB954] transition-colors"
              >
                List your first item
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
} 