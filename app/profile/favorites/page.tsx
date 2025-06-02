'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, MapPin, Trash2 } from 'lucide-react'

interface FavoriteItem {
  id: string
  listing_id: string
  name: string
  price: number
  image: string
  rating: number
  location: string
}

// Helper function to format rating
function formatRating(rating: number | string | null | undefined): string {
  if (!rating) return 'N/A'
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating
  return isNaN(numericRating) ? 'N/A' : numericRating.toFixed(1)
}

export default function FavoritesPage() {
  const { user } = useUser()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) return

      try {
        const response = await fetch(`/api/favorites?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setFavorites(data)
        }
      } catch (error) {
        console.error('Error fetching favorites:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [user])

  const removeFavorite = async (listingId: string) => {
    try {
      const response = await fetch(`/api/favorites/${listingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFavorites(favorites.filter(fav => fav.listing_id !== listingId))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Favorites</CardTitle>
      </CardHeader>
      <CardContent>
        {favorites.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">You haven't added any items to your wishlist yet.</p>
            <Button asChild>
              <Link href="/listings">Browse Listings</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-0">
                  <Image 
                    src={item.image || '/placeholder.svg?height=200&width=300'} 
                    alt={item.name} 
                    width={300} 
                    height={200} 
                    className="w-full h-48 object-cover rounded-t-lg" 
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                    <p className="text-gray-600 mb-2">{item.price} kr/day</p>
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1">{formatRating(item.rating)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      {item.location || 'Location not specified'}
                    </div>
                    <div className="flex justify-between">
                      <Button asChild variant="outline">
                        <Link href={`/listings/${item.listing_id}`}>View Details</Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => removeFavorite(item.listing_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

