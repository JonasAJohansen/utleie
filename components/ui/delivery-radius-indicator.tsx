'use client'

import React from 'react'
import { MapPin, Truck, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface DeliveryRadiusIndicatorProps {
  distance?: number | null // Distance in km
  deliveryRadius?: number // Maximum delivery radius in km
  className?: string
  showIcon?: boolean
  compact?: boolean
}

export function DeliveryRadiusIndicator({
  distance,
  deliveryRadius = 5,
  className,
  showIcon = true,
  compact = false
}: DeliveryRadiusIndicatorProps) {
  // Don't show if no distance is available
  if (distance === null || distance === undefined) {
    return null
  }

  // Determine delivery status
  const isWithinRadius = distance <= deliveryRadius
  const isNearby = distance <= 1
  const isClose = distance <= 3
  
  // Get appropriate styling based on distance
  const getDeliveryStatus = () => {
    if (isNearby) {
      return {
        variant: 'default' as const,
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: <MapPin className="h-3 w-3" />,
        label: 'Svært nær',
        deliveryTime: '< 30 min'
      }
    } else if (isClose) {
      return {
        variant: 'secondary' as const,
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: <Truck className="h-3 w-3" />,
        label: 'Nær deg',
        deliveryTime: '< 1 time'
      }
    } else if (isWithinRadius) {
      return {
        variant: 'outline' as const,
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: <Clock className="h-3 w-3" />,
        label: 'Kan leveres',
        deliveryTime: '< 2 timer'
      }
    } else {
      return {
        variant: 'outline' as const,
        color: 'bg-gray-50 text-gray-500 border-gray-200',
        icon: <MapPin className="h-3 w-3" />,
        label: 'Utenfor område',
        deliveryTime: 'Kontakt eier'
      }
    }
  }

  const status = getDeliveryStatus()

  if (compact) {
    return (
      <div className={cn("flex items-center text-xs text-gray-600", className)}>
        {showIcon && <MapPin className="h-3 w-3 mr-1" />}
        <span>{distance.toFixed(1)} km</span>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant={status.variant}
        className={cn("flex items-center gap-1 text-xs font-medium", status.color)}
      >
        {showIcon && status.icon}
        <span>{distance.toFixed(1)} km</span>
      </Badge>
      
      {isWithinRadius && (
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          <span>{status.deliveryTime}</span>
        </div>
      )}
    </div>
  )
}

// Alternative version for detailed delivery information
interface DeliveryInfoProps {
  distance?: number | null
  deliveryRadius?: number
  deliveryCost?: number
  className?: string
}

export function DeliveryInfo({
  distance,
  deliveryRadius = 5,
  deliveryCost = 50,
  className
}: DeliveryInfoProps) {
  if (distance === null || distance === undefined) {
    return null
  }

  const isWithinRadius = distance <= deliveryRadius
  const isNearby = distance <= 1

  // Calculate estimated delivery cost
  const estimatedCost = isNearby ? 0 : Math.ceil(distance * 10) // 10 kr per km

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">{distance.toFixed(1)} km unna</span>
        </div>
        
        {isWithinRadius && (
          <Badge variant="outline" className="text-xs">
            Levering tilgjengelig
          </Badge>
        )}
      </div>
      
      {isWithinRadius && (
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center justify-between">
            <span>Estimert leveringstid:</span>
            <span className="font-medium">
              {distance <= 1 ? '< 30 min' : distance <= 3 ? '< 1 time' : '< 2 timer'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Leveringskostnad:</span>
            <span className="font-medium">
              {isNearby ? 'Gratis' : `${estimatedCost} kr`}
            </span>
          </div>
        </div>
      )}
      
      {!isWithinRadius && (
        <div className="text-xs text-gray-500">
          Utenfor leveringsområde. Kontakt eier for andre alternativer.
        </div>
      )}
    </div>
  )
} 