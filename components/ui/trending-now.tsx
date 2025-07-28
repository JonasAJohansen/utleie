'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, Flame, Eye, Users, Loader2, Star, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingBadge } from '@/components/ui/listing-badges'
import { cn } from '@/lib/utils'

interface TrendingListing {
  id: string
  name: string
  price: number
  location: string
  category_id: string
  created_at: string
  image: string
  rating: number
  review_count: number
  owner_username: string
  trending: {
    rank: number
    views_period: number
    unique_viewers: number
    trending_score: number
    period_days: number
  }
  view_count: number
}

interface TrendingNowProps {
  title?: string
  limit?: number
  days?: number
  variant?: 'horizontal' | 'grid' | 'compact'
  className?: string
  showStats?: boolean
}

export function TrendingNow({
  title = 'Trending nå',
  limit = 8,
  days = 7,
  variant = 'horizontal',
  className,
  showStats = true
}: TrendingNowProps) {
  const [trendingItems, setTrendingItems] = useState<TrendingListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trendingType, setTrendingType] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/listings/trending?limit=${limit}&days=${days}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch trending listings')
        }

        const data = await response.json()
        setTrendingItems(data.trending || [])
        setTrendingType(data.type || '')
        setMessage(data.message || '')
      } catch (err) {
        console.error('Error fetching trending items:', err)
        setError('Kunne ikke laste trending annonser')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrending()
  }, [limit, days])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Nettopp'
    if (diffInHours < 24) return `${diffInHours}t siden`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d siden`
    
    return date.toLocaleDateString('no-NO', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Flame className="h-5 w-5 mr-2 text-orange-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-500">Laster trending annonser...</span>
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
            <Flame className="h-5 w-5 mr-2 text-orange-500" />
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

  if (trendingItems.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Flame className="h-5 w-5 mr-2 text-orange-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Ingen trending annonser for øyeblikket</p>
            <p className="text-xs text-gray-400 mt-1">
              Når annonser får mye aktivitet vil de dukke opp her
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
          <h3 className="text-sm font-medium text-gray-900 flex items-center">
            <Flame className="h-4 w-4 mr-2 text-orange-500" />
            {title}
          </h3>
          {message && (
            <span className="text-xs text-gray-500">{message}</span>
          )}
        </div>
        
        <div className="space-y-2">
          {trendingItems.slice(0, 5).map((item, index) => (
            <Link key={item.id} href={`/listings/${item.id}`}>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
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
                  
                  <div className="absolute -top-1 -right-1">
                    <TrendingBadge rank={item.trending.rank} compact={true} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">
                    {item.price} kr/dag
                  </p>
                  {showStats && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Eye className="h-3 w-3 mr-1" />
                      {item.trending.views_period} visninger
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Flame className="h-5 w-5 mr-2 text-orange-500" />
              {title}
            </CardTitle>
            {message && (
              <Badge variant="outline" className="text-xs">
                {message}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trendingItems.map((item) => (
              <Link key={item.id} href={`/listings/${item.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-square relative bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">📦</span>
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2">
                      <TrendingBadge rank={item.trending.rank} />
                    </div>
                    
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="text-xs bg-black/70 text-white border-none">
                        <Eye className="h-3 w-3 mr-1" />
                        {item.trending.views_period}
                      </Badge>
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

  // Horizontal variant (default)
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Flame className="h-5 w-5 mr-2 text-orange-500 animate-pulse" />
            {title}
          </CardTitle>
          {message && (
            <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
              <Clock className="h-3 w-3 mr-1" />
              {message}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {trendingItems.map((item, index) => (
            <Link key={item.id} href={`/listings/${item.id}`} className="flex-shrink-0">
              <Card className="w-64 overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-video relative bg-gray-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-3xl">📦</span>
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2">
                    <TrendingBadge rank={item.trending.rank} />
                  </div>
                  
                  {showStats && (
                    <div className="absolute bottom-2 right-2 space-y-1">
                      <Badge variant="secondary" className="text-xs bg-black/70 text-white border-none">
                        <Eye className="h-3 w-3 mr-1" />
                        {item.trending.views_period}
                      </Badge>
                      {item.trending.unique_viewers > 1 && (
                        <Badge variant="secondary" className="text-xs bg-black/70 text-white border-none">
                          <Users className="h-3 w-3 mr-1" />
                          {item.trending.unique_viewers}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-medium text-base truncate mb-2">
                    {item.name}
                  </h3>
                  <p className="text-emerald-600 font-bold text-lg mb-2">
                    {item.price} kr/dag
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    {item.rating > 0 ? (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {item.rating.toFixed(1)} ({item.review_count})
                      </div>
                    ) : (
                      <span>Ny annonse</span>
                    )}
                    
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      #{item.trending.rank}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 flex items-center justify-between">
                    <span className="truncate">{item.location}</span>
                    <span>{formatTimeAgo(item.created_at)}</span>
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