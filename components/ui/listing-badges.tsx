'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Eye,
  Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListingBadgesProps {
  listing: {
    id: string
    created_at: string
    status?: string
    view_count?: number
    rental_end_date?: string | null
    is_available?: boolean
  }
  trending?: {
    rank?: number
    views_last_week?: number
  }
  className?: string
  compact?: boolean
}

export function ListingBadges({ 
  listing, 
  trending, 
  className, 
  compact = false 
}: ListingBadgesProps) {
  const badges = []

  // Just Listed Badge (24-48 hours)
  const isJustListed = () => {
    const createdAt = new Date(listing.created_at)
    const now = new Date()
    const hoursAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    return hoursAgo <= 48
  }

  // Trending Badge (top viewed in last week)
  const isTrending = () => {
    return trending && trending.rank && trending.rank <= 10
  }

  // Availability Status
  const getAvailabilityStatus = () => {
    if (listing.status !== 'active') return null
    
    if (listing.rental_end_date) {
      const endDate = new Date(listing.rental_end_date)
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      if (endDate <= now) {
        return { type: 'available', text: 'Tilgjengelig nå', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' }
      } else if (endDate <= tomorrow) {
        return { type: 'tomorrow', text: 'Tilgjengelig i morgen', icon: Clock, color: 'bg-orange-100 text-orange-700' }
      } else {
        const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return { 
          type: 'unavailable', 
          text: `Tilgjengelig om ${daysUntil} ${daysUntil === 1 ? 'dag' : 'dager'}`, 
          icon: Calendar, 
          color: 'bg-gray-100 text-gray-600' 
        }
      }
    }
    
    return { type: 'available', text: 'Tilgjengelig nå', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' }
  }

  // Add Just Listed badge
  if (isJustListed()) {
    badges.push(
      <Badge 
        key="just-listed"
        variant="default" 
        className={cn(
          "bg-emerald-500 text-white border-emerald-500 shadow-sm",
          compact ? "text-xs px-2 py-0.5" : "text-xs px-2 py-1"
        )}
      >
        <Sparkles className={cn(compact ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} />
        {compact ? "Ny" : "Ny annonse"}
      </Badge>
    )
  }

  // Add Trending badge
  if (isTrending()) {
    badges.push(
      <Badge 
        key="trending"
        variant="default"
        className={cn(
          "bg-orange-500 text-white border-orange-500 shadow-sm",
          compact ? "text-xs px-2 py-0.5" : "text-xs px-2 py-1"
        )}
      >
        <Flame className={cn(compact ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} />
        {compact ? `#${trending?.rank}` : `Trending #${trending?.rank}`}
      </Badge>
    )
  }

  // Add High Interest badge (lots of views)
  if (listing.view_count && listing.view_count > 50) {
    badges.push(
      <Badge 
        key="popular"
        variant="secondary"
        className={cn(
          "bg-purple-100 text-purple-700 border-purple-200",
          compact ? "text-xs px-2 py-0.5" : "text-xs px-2 py-1"
        )}
      >
        <Eye className={cn(compact ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} />
        {compact ? "Populær" : `${listing.view_count}+ visninger`}
      </Badge>
    )
  }

  // Add Availability Status
  const availabilityStatus = getAvailabilityStatus()
  if (availabilityStatus) {
    const IconComponent = availabilityStatus.icon
    badges.push(
      <Badge 
        key="availability"
        variant="outline"
        className={cn(
          availabilityStatus.color,
          "border-current",
          compact ? "text-xs px-2 py-0.5" : "text-xs px-2 py-1"
        )}
      >
        <IconComponent className={cn(compact ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} />
        {compact && availabilityStatus.type === 'available' ? "Ledig" : availabilityStatus.text}
      </Badge>
    )
  }

  if (badges.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {badges}
    </div>
  )
}

// Specialized components for specific use cases
export function JustListedBadge({ 
  createdAt, 
  compact = false,
  className 
}: { 
  createdAt: string
  compact?: boolean
  className?: string 
}) {
  const created = new Date(createdAt)
  const now = new Date()
  const hoursAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
  
  if (hoursAgo > 48) return null

  return (
    <Badge 
      variant="default"
      className={cn(
        "bg-emerald-500 text-white border-emerald-500 shadow-sm",
        compact ? "text-xs px-2 py-0.5" : "text-xs px-2 py-1",
        className
      )}
    >
      <Sparkles className={cn(compact ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} />
      {compact ? "Ny" : hoursAgo < 24 ? "I dag" : "I går"}
    </Badge>
  )
}

export function TrendingBadge({ 
  rank, 
  compact = false,
  className 
}: { 
  rank: number
  compact?: boolean
  className?: string 
}) {
  if (rank > 10) return null

  return (
    <Badge 
      variant="default"
      className={cn(
        "bg-orange-500 text-white border-orange-500 shadow-sm animate-pulse",
        compact ? "text-xs px-2 py-0.5" : "text-xs px-2 py-1",
        className
      )}
    >
      <Flame className={cn(compact ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} />
      {compact ? `#${rank}` : `Trending #${rank}`}
    </Badge>
  )
}

export function AvailabilityBadge({ 
  rentalEndDate, 
  compact = false,
  className 
}: { 
  rentalEndDate?: string | null
  compact?: boolean
  className?: string 
}) {
  if (!rentalEndDate) {
    // Available now
    return (
      <Badge 
        variant="outline"
        className={cn(
          "bg-emerald-100 text-emerald-700 border-emerald-200",
          compact ? "text-xs px-2 py-0.5" : "text-xs px-2 py-1",
          className
        )}
      >
        <CheckCircle className={cn(compact ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} />
        {compact ? "Ledig" : "Tilgjengelig nå"}
      </Badge>
    )
  }

  const endDate = new Date(rentalEndDate)
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  
  if (endDate <= now) {
    return (
      <Badge 
        variant="outline"
        className={cn(
          "bg-emerald-100 text-emerald-700 border-emerald-200",
          compact ? "text-xs px-2 py-0.5" : "text-xs px-2 py-1",
          className
        )}
      >
        <CheckCircle className={cn(compact ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} />
        {compact ? "Ledig" : "Tilgjengelig nå"}
      </Badge>
    )
  } else if (endDate <= tomorrow) {
    return (
      <Badge 
        variant="outline"
        className={cn(
          "bg-orange-100 text-orange-700 border-orange-200",
          compact ? "text-xs px-2 py-0.5" : "text-xs px-2 py-1",
          className
        )}
      >
        <Clock className={cn(compact ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} />
        {compact ? "I morgen" : "Tilgjengelig i morgen"}
      </Badge>
    )
  } else {
    const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return (
      <Badge 
        variant="outline"
        className={cn(
          "bg-gray-100 text-gray-600 border-gray-200",
          compact ? "text-xs px-2 py-0.5" : "text-xs px-2 py-1",
          className
        )}
      >
        <Calendar className={cn(compact ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1")} />
        {compact ? `${daysUntil}d` : `Om ${daysUntil} ${daysUntil === 1 ? 'dag' : 'dager'}`}
      </Badge>
    )
  }
} 