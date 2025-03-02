'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface SimilarListing {
  id: string
  name: string
  price: number
  image: string
  category?: string
  location?: string
  rating: number
  reviewCount: number
  username: string
  userImage?: string
}

interface SimilarListingsProps {
  listingId: string
  categoryId?: string
  className?: string
}

export function SimilarListings({ listingId, categoryId, className }: SimilarListingsProps) {
  const [listings, setListings] = useState<SimilarListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const fetchSimilarListings = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const params = new URLSearchParams()
        if (listingId) params.append('listingId', listingId)
        if (categoryId) params.append('categoryId', categoryId)
        
        const response = await fetch(`/api/listings/similar?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch similar listings')
        }
        
        const data = await response.json()
        setListings(data)
      } catch (err) {
        console.error('Error fetching similar listings:', err)
        setError('Could not load similar items')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSimilarListings()
  }, [listingId, categoryId])
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }
  
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Similar Items</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="rounded-lg bg-gray-100 h-64 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  
  if (error || listings.length === 0) {
    return null // Don't show anything if there are no similar listings
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Similar Items</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={scrollLeft}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={scrollRight}
            className="rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {listings.map((listing, index) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="min-w-[250px] w-[250px] snap-start"
          >
            <Link href={`/listings/${listing.id}`}>
              <Card className="overflow-hidden h-full hover:shadow-md transition-shadow duration-300">
                <div className="relative h-36">
                  <Image
                    src={listing.image}
                    alt={listing.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 250px"
                  />
                  {listing.category && (
                    <Badge className="absolute top-2 left-2 bg-black/70 hover:bg-black/70 text-white text-xs">
                      {listing.category}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-1">{listing.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm font-bold text-[#4CD964]">{listing.price} kr/day</p>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs ml-1">
                        {listing.rating > 0 ? listing.rating.toFixed(1) : 'New'}
                      </span>
                    </div>
                  </div>
                  {listing.location && (
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{listing.location}</span>
                    </div>
                  )}
                  <div className="flex items-center mt-2">
                    <div className="relative w-5 h-5 rounded-full overflow-hidden">
                      <Image
                        src={listing.userImage || '/placeholder.svg'}
                        alt={listing.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs text-gray-600 ml-1 truncate">{listing.username}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <style jsx>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
} 