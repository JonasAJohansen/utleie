'use client'

import { AnimatedSearchCard } from "@/components/ui/animated-search-card"
import { Skeleton } from "@/components/ui/skeleton"

interface MapListingGridProps {
  listings: any[]
  isLoading: boolean
}

export function MapListingGrid({ listings, isLoading }: MapListingGridProps) {
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl p-4">
        <div className="flex flex-col items-center justify-center py-16">
          <h3 className="text-xl font-medium text-gray-900 mb-2">Ingen annonser funnet</h3>
          <p className="text-gray-500 text-center max-w-md">
            Prøv å justere søket ditt eller velg en annen kategori for å se flere resultater.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((item, index) => (
          <AnimatedSearchCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  )
} 