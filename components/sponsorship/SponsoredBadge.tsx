'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Crown, Star } from 'lucide-react'

interface SponsoredBadgeProps {
  variant?: 'default' | 'small' | 'large'
  className?: string
}

export function SponsoredBadge({ variant = 'default', className = '' }: SponsoredBadgeProps) {
  const variants = {
    small: {
      badge: 'text-xs px-2 py-1',
      icon: 'h-3 w-3',
      text: 'Sponsored'
    },
    default: {
      badge: 'text-sm px-3 py-1',
      icon: 'h-4 w-4', 
      text: 'Sponsored'
    },
    large: {
      badge: 'text-base px-4 py-2',
      icon: 'h-5 w-5',
      text: 'Sponsored Listing'
    }
  }

  const config = variants[variant]

  return (
    <Badge 
      className={`
        bg-gradient-to-r from-yellow-400 to-orange-500 
        text-white border-0 font-semibold
        hover:from-yellow-500 hover:to-orange-600
        shadow-sm
        ${config.badge} 
        ${className}
      `}
    >
      <Crown className={`mr-1 ${config.icon}`} />
      {config.text}
    </Badge>
  )
}

interface SponsoredListingCardProps {
  children: React.ReactNode
  isSponsored: boolean
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  badgeVariant?: 'default' | 'small' | 'large'
  className?: string
}

export function SponsoredListingCard({ 
  children, 
  isSponsored, 
  badgePosition = 'top-right',
  badgeVariant = 'small',
  className = ''
}: SponsoredListingCardProps) {
  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2', 
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2'
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      {isSponsored && (
        <div className={`absolute z-10 ${positionClasses[badgePosition]}`}>
          <SponsoredBadge variant={badgeVariant} />
        </div>
      )}
    </div>
  )
}

interface SponsoredSearchResultProps {
  isSponsored: boolean
  priority?: number
  className?: string
}

export function SponsoredSearchResult({ 
  isSponsored, 
  priority = 1, 
  className = '' 
}: SponsoredSearchResultProps) {
  if (!isSponsored) return null

  return (
    <div className={`flex items-center gap-2 text-sm text-orange-600 ${className}`}>
      <Star className="h-4 w-4 fill-current" />
      <span className="font-medium">Sponsored Result</span>
      {priority > 1 && (
        <Badge variant="outline" className="text-xs border-orange-200 text-orange-600">
          Premium
        </Badge>
      )}
    </div>
  )
}
