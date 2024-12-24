'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, MessageCircle, MapPin, DollarSign, Flag } from 'lucide-react'
import { RentalRequest } from '@/components/RentalRequest'
import { ReportDialog } from '@/components/ReportDialog'
import { HeartButton } from '@/components/HeartButton'

interface ListingDetailsProps {
  item: {
    id: string
    name: string
    description: string
    price: number
    rating: number
    review_count: number
    location: string | null
    user_id: string
    username: string
    user_image: string | null
  }
  userId: string
}

export function ListingDetails({ item, userId }: ListingDetailsProps) {
  const rating = parseFloat(item.rating.toString())
  const hasRating = !isNaN(rating) && item.review_count > 0

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{item.name}</h1>
          <HeartButton itemId={item.id} />
        </div>
        <div className="flex items-center mb-4">
          <Star className="h-5 w-5 text-yellow-400 fill-current" />
          <span className="ml-1 font-semibold">
            {hasRating ? `${rating.toFixed(1)} (${item.review_count} reviews)` : 'No reviews yet'}
          </span>
        </div>
        <div className="flex items-center mb-4 text-2xl font-bold text-green-600">
          <DollarSign className="h-6 w-6 mr-1" />
          {item.price}
          <span className="text-base font-normal text-gray-600 ml-1">/ day</span>
        </div>
        <div className="flex items-center mb-6 text-gray-600">
          <MapPin className="h-5 w-5 mr-2" />
          <span>{item.location || 'Location not specified'}</span>
        </div>
        <p className="text-gray-700 mb-6">{item.description}</p>
        <div className="flex space-x-4">
          <RentalRequest 
            itemId={item.id} 
            itemName={item.name} 
            pricePerDay={item.price}
            unavailableDates={[]}
          />
          <Button asChild>
            <Link href={`/chat?userId=${item.user_id}&listingId=${item.id}&listingName=${encodeURIComponent(item.name)}`}>
              <MessageCircle className="mr-2 h-4 w-4" /> Chat with Owner
            </Link>
          </Button>
          <Button variant="outline">
            <Flag className="mr-2 h-4 w-4" /> Report Listing
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About the Owner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Image 
              src={item.user_image || '/placeholder.svg?height=100&width=100'} 
              alt={item.username} 
              width={64} 
              height={64} 
              className="rounded-full" 
            />
            <div className="ml-4">
              <Link href={`/profile/${item.user_id}`} className="text-xl font-semibold hover:underline">
                {item.username}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 