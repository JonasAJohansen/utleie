'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, MapPin, Trash2 } from 'lucide-react'

interface WishlistItem {
  id: number
  name: string
  price: number
  image: string
  rating: number
  location: string
  priceType: string
}

export function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    const mockWishlistItems: WishlistItem[] = [
      { id: 1, name: 'Mountain Bike', price: 25, image: '/placeholder.svg?height=200&width=300', rating: 4.5, location: 'Denver, CO', priceType: 'day' },
      { id: 2, name: 'DSLR Camera', price: 40, image: '/placeholder.svg?height=200&width=300', rating: 4.8, location: 'New York, NY', priceType: 'day' },
    ]
    setWishlistItems(mockWishlistItems)
  }, [])

  const removeFromWishlist = (id: number) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Wishlist</CardTitle>
      </CardHeader>
      <CardContent>
        {wishlistItems.length === 0 ? (
          <p>Your wishlist is empty.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-0">
                  <Image src={item.image} alt={item.name} width={300} height={200} className="w-full h-48 object-cover rounded-t-lg" />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                    <p className="text-gray-600 mb-2">${item.price}/{item.priceType}</p>
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1">{item.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      {item.location}
                    </div>
                    <div className="flex justify-between">
                      <Button asChild variant="outline">
                        <Link href={`/listings/${item.id}`}>View Details</Link>
                      </Button>
                      <Button variant="ghost" onClick={() => removeFromWishlist(item.id)}>
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

