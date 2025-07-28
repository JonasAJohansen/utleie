'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { FavoriteButton } from '@/app/components/ui/favorite-button'
import { DeliveryRadiusIndicator } from '@/components/ui/delivery-radius-indicator'
import { JustListedBadge, AvailabilityBadge } from '@/components/ui/listing-badges'

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
    distance_km?: number | null
    created_at: string
    view_count?: number
    rental_end_date?: string | null
  }
  currentUser: string | null
  showFavoriteButton?: boolean
  initialIsFavorited?: boolean
  trending?: {
    rank?: number
    views_last_week?: number
  }
}

export default function ListingCard({ 
  data, 
  currentUser,
  showFavoriteButton = false,
  initialIsFavorited = false,
  trending
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
          
          {/* Activity Badges */}
          <div className="absolute top-2 left-2 space-y-1">
            <JustListedBadge 
              createdAt={data.created_at} 
              compact={true}
            />
          </div>
          
          {/* Trending Badge */}
          {trending && trending.rank && trending.rank <= 10 && (
            <div className="absolute top-2 right-2">
              <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-sm animate-pulse">
                🔥 #{trending.rank}
              </div>
            </div>
          )}
          
          {/* Availability Status */}
          <div className="absolute bottom-2 right-2">
            <AvailabilityBadge 
              rentalEndDate={data.rental_end_date}
              compact={true}
            />
          </div>
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
        <p className="text-gray-600 mb-2">{data.price} kr/day</p>
        <div className="flex items-center mb-2">
          <Star className="h-6 w-6 text-yellow-400 fill-current" />
          <span className="ml-1">
            {hasRating ? `${data.rating.toFixed(1)} (${data.review_count})` : 'No reviews yet'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {data.location || 'Location not specified'}
          </div>
          
          <DeliveryRadiusIndicator 
            distance={data.distance_km} 
            compact={true}
            className="ml-2"
          />
        </div>
        
        {/* View count indicator */}
        {data.view_count && data.view_count > 0 && (
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {data.view_count} {data.view_count === 1 ? 'visning' : 'visninger'}
          </div>
        )}
        
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