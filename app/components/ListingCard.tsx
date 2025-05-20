'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { FavoriteButton } from '@/app/components/ui/favorite-button'

interface ListingCardProps {
  data: {
    id: string
    name: string
    price: number
    image_url?: string
    rating: number
    review_count: number
    location: string
    user_id: string
    username: string
    user_image: string | null
  }
  currentUser: string | null
  showFavoriteButton?: boolean
  initialIsFavorited?: boolean
}

export default function ListingCard({ 
  data, 
  currentUser,
  showFavoriteButton = false,
  initialIsFavorited = false
}: ListingCardProps) {
  const hasRating = !isNaN(data.rating) && data.review_count > 0

  return (
    <Card className="overflow-hidden h-full">
      <Link href={`/listings/${data.id}`}>
        <div className="relative h-48">
          <Image
            src={data.image_url || '/placeholder.svg?height=200&width=300'}
            alt={data.name}
            fill
            className="object-cover"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/listings/${data.id}`} className="hover:underline">
            <h3 className="font-semibold text-lg">{data.name}</h3>
          </Link>
          {showFavoriteButton && currentUser && (
            <FavoriteButton
              listingId={data.id}
              initialIsFavorited={initialIsFavorited}
            />
          )}
        </div>
        <p className="text-gray-600 mb-2">${data.price}/day</p>
        <div className="flex items-center mb-2">
          <Star className="h-6 w-6 text-yellow-400 fill-current" />
          <span className="ml-1">
            {hasRating ? `${data.rating.toFixed(1)} (${data.review_count})` : 'No reviews yet'}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-1" />
          {data.location || 'Location not specified'}
        </div>
        <div className="mt-4 flex items-center">
          <Image
            src={data.user_image || '/placeholder.svg'}
            alt={data.username}
            width={24}
            height={24}
            className="rounded-full mr-2"
          />
          <Link href={`/profile/${data.user_id}`} className="text-sm text-gray-600 hover:underline">
            {data.username}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
} 