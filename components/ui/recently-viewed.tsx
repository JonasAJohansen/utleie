'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, X, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRecentlyViewed } from '@/hooks/use-recently-viewed'
import { cn } from '@/lib/utils'

interface RecentlyViewedProps {
  variant?: 'sidebar' | 'section' | 'compact'
  title?: string
  showClearAll?: boolean
  maxItems?: number
  className?: string
}

export function RecentlyViewed({
  variant = 'section',
  title = 'Nylig sett',
  showClearAll = true,
  maxItems,
  className
}: RecentlyViewedProps) {
  const { recentItems, isLoading, removeItem, clearAll } = useRecentlyViewed()

  // Apply maxItems limit if specified
  const displayItems = maxItems ? recentItems.slice(0, maxItems) : recentItems

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Nettopp'
    if (diffInHours < 24) return `${diffInHours} timer siden`
    if (diffInHours < 48) return 'I går'
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} dager siden`
    
    return date.toLocaleDateString('no-NO', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (displayItems.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Ingen nylig sette gjenstander</p>
            <p className="text-xs text-gray-400 mt-1">
              Når du ser på annonser vil de dukke opp her
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Compact variant for sidebars
  if (variant === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          {showClearAll && displayItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearAll()}
              className="h-6 px-2 text-xs text-gray-500 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          {displayItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-2 group">
              <Link href={`/listings/${item.id}`} className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100">
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
                  <p className="text-xs text-gray-500">
                    {item.price} kr/dag
                  </p>
                </div>
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        
        {maxItems && recentItems.length > maxItems && (
          <Link 
            href="/profile/recently-viewed" 
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Se alle ({recentItems.length})
          </Link>
        )}
      </div>
    )
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {title}
            </CardTitle>
            {showClearAll && displayItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearAll()}
                className="h-7 px-2 text-xs text-gray-500 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Tøm
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {displayItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 group">
                <Link href={`/listings/${item.id}`} className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">📦</span>
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
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(item.viewedAt)}
                    </p>
                  </div>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          
          {maxItems && recentItems.length > maxItems && (
            <div className="mt-4 pt-3 border-t">
              <Link 
                href="/profile/recently-viewed" 
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Se alle {recentItems.length} gjenstander →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Section variant for main content areas
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
          {showClearAll && displayItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearAll()}
              className="text-gray-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Tøm alle
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayItems.map((item) => (
            <div key={item.id} className="group relative">
              <Link href={`/listings/${item.id}`}>
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
                        <span className="text-gray-400 text-4xl">📦</span>
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs bg-white/80 backdrop-blur-sm">
                        {formatTimeAgo(item.viewedAt)}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate mb-1">
                      {item.name}
                    </h3>
                    <p className="text-emerald-600 font-bold text-sm">
                      {item.price} kr/dag
                    </p>
                    {item.location && (
                      <p className="text-xs text-gray-500 truncate">
                        {item.location}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 h-7 w-7 p-0 bg-white/80 backdrop-blur-sm text-gray-600 hover:text-red-600 hover:bg-white/90"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 