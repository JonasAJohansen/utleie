'use client'

import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import ListingGallery from './ListingGallery'
import { ListingDetails } from './ListingDetails'
import { SocialProof } from '@/components/listings/SocialProof'
import { AvailabilityCalendar } from '@/components/listings/AvailabilityCalendar'

interface ListingPhoto {
  id: string
  url: string
  description: string
  isMain: boolean
  displayOrder: number
}

interface ListingPageClientProps {
  listingData: {
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
    photos: ListingPhoto[]
    userId: string | null
    isFavorited: boolean
    mainImageUrl: string
    imageUrls: string[]
    categoryId: string
    categoryName?: string
  }
}

export function ListingPageClient({ listingData }: ListingPageClientProps) {
  const { 
    userId, 
    isFavorited, 
    photos, 
    categoryId,
    ...itemDetails 
  } = listingData

  return (
    <>
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Column - Gallery & Details */}
        <div className="lg:col-span-2 space-y-8">
          <Suspense fallback={<Skeleton className="h-[450px] w-full rounded-lg" />}>
            <ListingGallery photos={photos} />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-20 w-full rounded-lg" />}>
            <SocialProof listingId={listingData.id} />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-lg" />}>
            <ListingDetails 
              item={itemDetails} 
              userId={userId} 
              isFavorited={isFavorited} 
            />
          </Suspense>
        </div>

        {/* Right Column - Calendar & Booking */}
        <div className="space-y-8">
          <Suspense fallback={<Skeleton className="h-[450px] w-full rounded-lg" />}>
            <AvailabilityCalendar listingId={listingData.id} />
          </Suspense>
        </div>
      </motion.div>

      {/* Similar Listings section has been disabled */}
    </>
  )
} 