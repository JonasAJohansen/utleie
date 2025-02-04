'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, MessageCircle, MapPin, DollarSign, Flag } from 'lucide-react'
import { RentalRequest } from '@/components/RentalRequest'
import { ReportDialog } from '@/components/ReportDialog'
import { FavoriteButton } from '../../components/ui/favorite-button'

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
    condition?: string
  }
  userId: string | null
  isFavorited?: boolean
}

const conditionLabels: Record<string, string> = {
  'helt_ny': 'Helt ny',
  'som_ny': 'Som ny',
  'pent_brukt': 'Pent brukt',
  'godt_brukt': 'Godt brukt'
}

export function ListingDetails({ item, userId, isFavorited = false }: ListingDetailsProps) {
  const rating = parseFloat(item.rating.toString())
  const hasRating = !isNaN(rating) && item.review_count > 0
  const isLoggedIn = !!userId

  console.log('ListingDetails - Full item data:', JSON.stringify(item, null, 2))
  console.log('ListingDetails - condition value:', item.condition)
  console.log('ListingDetails - condition label:', item.condition ? conditionLabels[item.condition] : 'No condition')

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{item.name}</h1>
          {isLoggedIn && (
            <FavoriteButton
              listingId={item.id}
              initialIsFavorited={isFavorited}
            />
          )}
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
        {item.condition && (
          <div className="flex items-center mb-4 text-gray-600">
            <span className="font-medium">Tilstand: </span>
            <span className="ml-2">{conditionLabels[item.condition] || item.condition}</span>
          </div>
        )}
        <div className="flex items-center mb-6 text-gray-600">
          <MapPin className="h-5 w-5 mr-2" />
          <span>{item.location || 'Location not specified'}</span>
        </div>
        <p className="text-gray-700 mb-6">{item.description}</p>
        <div className="flex space-x-4">
          {isLoggedIn ? (
            <>
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
            </>
          ) : (
            <Button asChild>
              <Link href="/sign-in">Sign in to rent or contact owner</Link>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About the Owner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Image 
              src={item.user_image || '/placeholder.svg'} 
              alt={item.username} 
              width={64} 
              height={64} 
              className="rounded-full object-cover aspect-square"
              style={{ width: '64px', height: '64px' }}
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