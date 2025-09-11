'use client'

import { motion } from "framer-motion"
import Image from 'next/image'
import { Star, MapPin } from 'lucide-react'
import Link from 'next/link'
import { SponsoredListingCard } from '@/components/sponsorship/SponsoredBadge'

interface AnimatedSearchCardProps {
  item: {
    id: string
    name: string
    price: number
    image: string
    rating: number | string | null
    location: string
    features: string[]
    isSponsored?: boolean
    sponsoredUntil?: string | null
  }
  index: number
}

export function AnimatedSearchCard({ item, index }: AnimatedSearchCardProps) {
  // Function to safely format the rating
  const formatRating = (rating: any): string => {
    if (rating === null || rating === undefined) return 'N/A';
    const numRating = Number(rating);
    return !isNaN(numRating) ? numRating.toFixed(1) : 'N/A';
  };

  // Handle sponsored listing click tracking
  const handleSponsoredClick = async () => {
    if (item.isSponsored) {
      try {
        await fetch('/api/sponsorship/track-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: item.id })
        });
      } catch (error) {
        console.error('Failed to track sponsored click:', error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Link href={`/listings/${item.id}`} onClick={handleSponsoredClick}>
        <SponsoredListingCard 
          isSponsored={item.isSponsored || false}
          badgePosition="top-right"
          badgeVariant="small"
          className="h-full"
        >
          <motion.div 
            className={`bg-white rounded-lg shadow-md overflow-hidden h-full ${
              item.isSponsored ? 'ring-2 ring-yellow-200 shadow-lg' : ''
            }`}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
          <div className="relative h-48">
            <Image
              src={item.image || '/placeholder.svg?height=200&width=300'}
              alt={item.name}
              fill
              className="object-cover"
            />
            <motion.div 
              className="absolute inset-0 bg-black/40 opacity-0 transition-opacity"
              whileHover={{ opacity: 1 }}
            >
              <div className="flex items-center justify-center h-full">
                <motion.span 
                  className="text-white font-medium"
                  initial={{ y: 10, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  View Details
                </motion.span>
              </div>
            </motion.div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
            <p className="text-gray-600 mb-2">{item.price} kr/day</p>
            <div className="flex items-center mb-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1">{formatRating(item.rating)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              {item.location || 'Location not specified'}
            </div>
            {item.features?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.features.slice(0, 2).map((feature, i) => (
                  <motion.span
                    key={i}
                    className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full"
                    whileHover={{ scale: 1.05 }}
                  >
                    {feature}
                  </motion.span>
                ))}
                {item.features.length > 2 && (
                  <motion.span
                    className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full"
                    whileHover={{ scale: 1.05 }}
                  >
                    +{item.features.length - 2} more
                  </motion.span>
                )}
              </div>
            )}
          </div>
          </motion.div>
        </SponsoredListingCard>
      </Link>
    </motion.div>
  )
} 