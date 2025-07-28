'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Users, TrendingUp, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Recommendation {
  id: string
  name: string
  price: number
  location: string
  category_id: string
  image: string
  rating: number
  review_count: number
  owner_username: string
  recommendation_type: 'rental_correlation' | 'similar_category'
  recommendation_strength?: number
  rental_frequency?: number
}

interface RecommendationsProps {
  listingId: string
  title?: string
  limit?: number
  variant?: 'horizontal' | 'grid' | 'compact'
  className?: string
  showRecommendationType?: boolean
}

export function Recommendations({
  listingId,
  title = 'Andre leide også',
  limit = 6,
  variant = 'horizontal',
  className,
  showRecommendationType = true
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendationType, setRecommendationType] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!listingId) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/listings/${listingId}/recommendations?limit=${limit}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations')
        }

        const data = await response.json()
        setRecommendations(data.recommendations || [])
        setRecommendationType(data.type || '')
        setMessage(data.message || '')
      } catch (err) {
        console.error('Error fetching recommendations:', err)
        setError('Kunne ikke laste anbefalinger')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [listingId, limit])

  const getRecommendationBadge = (item: Recommendation) => {
    if (item.recommendation_type === 'rental_correlation' && item.recommendation_strength) {
      return (
        <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
          <Users className="h-3 w-3 mr-1" />
          {item.recommendation_strength} leide også
        </Badge>
      )
    }
    
    if (item.recommendation_type === 'similar_category') {
      return (
        <Badge variant="outline" className="text-xs">
          <TrendingUp className="h-3 w-3 mr-1" />
          Samme kategori
        </Badge>
      )
    }
    
    return null
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-500">Henter anbefalinger...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Ingen anbefalinger tilgjengelig</p>
            <p className="text-xs text-gray-400 mt-1">
              Når flere brukere leier lignende gjenstander vil anbefalinger dukke opp her
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Compact variant for sidebars
  if (variant === 'compact') {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          {showRecommendationType && message && (
            <span className="text-xs text-gray-500">{message}</span>
          )}
        </div>
        
        <div className="space-y-2">
          {recommendations.slice(0, 4).map((item) => (
            <Link key={item.id} href={`/listings/${item.id}`}>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">📦</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">
                    {item.price} kr/dag
                  </p>
                  {item.rating > 0 && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      {item.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  // Grid variant
  if (variant === 'grid') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              {title}
            </div>
            {showRecommendationType && message && (
              <Badge variant="outline" className="text-xs">
                {message}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recommendations.map((item) => (
              <Link key={item.id} href={`/listings/${item.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square relative bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">📦</span>
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2">
                      {getRecommendationBadge(item)}
                    </div>
                  </div>
                  
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate mb-1">
                      {item.name}
                    </h3>
                    <p className="text-emerald-600 font-bold text-sm mb-1">
                      {item.price} kr/dag
                    </p>
                    
                    {item.rating > 0 && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        {item.rating.toFixed(1)} ({item.review_count})
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Horizontal variant (default)
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
          {showRecommendationType && message && (
            <Badge variant="outline" className="text-xs">
              {message}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {recommendations.map((item) => (
            <Link key={item.id} href={`/listings/${item.id}`} className="flex-shrink-0">
              <Card className="w-48 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square relative bg-gray-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-3xl">📦</span>
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2">
                    {getRecommendationBadge(item)}
                  </div>
                </div>
                
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm truncate mb-1">
                    {item.name}
                  </h3>
                  <p className="text-emerald-600 font-bold text-sm mb-1">
                    {item.price} kr/dag
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {item.rating > 0 ? (
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        {item.rating.toFixed(1)}
                      </div>
                    ) : (
                      <span>Ny annonse</span>
                    )}
                    
                    <span className="truncate ml-2">{item.location}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 