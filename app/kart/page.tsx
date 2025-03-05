'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapSearchBar } from '@/components/map/MapSearchBar'
import { CategoryScrollbar } from '@/components/map/CategoryScrollbar'
import { MapListingGrid } from '@/components/map/MapListingGrid'
import dynamic from 'next/dynamic'
import { ToggleView } from '@/components/map/ToggleView'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

// Dynamically load MapView component without SSR
const MapView = dynamic(
  () => import('@/components/map/MapView').then((mod) => mod.MapView),
  { ssr: false, loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )}
)

export default function MapSearchPage() {
  return (
    <Suspense fallback={
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <MapSearchContent />
    </Suspense>
  )
}

function MapSearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeView, setActiveView] = useState<'list' | 'map' | 'split'>('split')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  )
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    radius: number;
    name: string;
  } | null>(null)
  const [mapBounds, setMapBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
    center: { lat: number, lng: number };
  } | null>(null)
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showMap, setShowMap] = useState(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')
  
  // When on mobile, default to list view
  useEffect(() => {
    if (isMobile) {
      setActiveView('list')
      setShowMap(false)
    } else {
      setActiveView('split')
      setShowMap(true)
    }
  }, [isMobile])
  
  // Fetch listings based on search params, map bounds, or search query
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true)
      
      try {
        // Build the query parameters
        const params = new URLSearchParams()
        
        if (selectedCategory) {
          params.append('category', selectedCategory)
        }
        
        // If we have a search query, use the search API
        if (searchQuery.trim()) {
          const searchResponse = await fetch(`/api/listings/search?query=${encodeURIComponent(searchQuery)}`)
          if (!searchResponse.ok) throw new Error('Failed to fetch search results')
          
          const searchData = await searchResponse.json()
          setListings(searchData.items || [])
          setIsLoading(false)
          return
        }
        
        // Always use map bounds if available, even when location is selected
        // This allows searching within the current visible map area
        if (mapBounds) {
          params.append('north', mapBounds.north.toString())
          params.append('south', mapBounds.south.toString())
          params.append('east', mapBounds.east.toString())
          params.append('west', mapBounds.west.toString())
          params.append('centerLat', mapBounds.center.lat.toString())
          params.append('centerLng', mapBounds.center.lng.toString())
        } 
        // Otherwise use the selected location if available
        else if (selectedLocation) {
          params.append('lat', selectedLocation.lat.toString())
          params.append('lng', selectedLocation.lng.toString())
          params.append('radius', selectedLocation.radius.toString())
          params.append('location', selectedLocation.name)
        }
        
        // Get the listings
        const response = await fetch(`/api/map-search?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch listings')
        
        const data = await response.json()
        setListings(data.items || [])
      } catch (error) {
        console.error('Error fetching listings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchListings()
  }, [selectedCategory, selectedLocation, mapBounds, searchQuery])
  
  const handleViewToggle = (view: 'list' | 'map' | 'split') => {
    setActiveView(view)
    setShowMap(view === 'map' || view === 'split')
  }
  
  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    radius: number;
    name: string;
  } | null) => {
    setSelectedLocation(location)
    // Don't reset map bounds when location is selected
    // This allows the map to maintain its position
    // Remove: setMapBounds(null)
    
    // Update URL params
    const params = new URLSearchParams(searchParams.toString())
    
    if (location) {
      params.set('lat', location.lat.toString())
      params.set('lng', location.lng.toString())
      params.set('radius', location.radius.toString())
      params.set('location', location.name)
    } else {
      params.delete('lat')
      params.delete('lng')
      params.delete('radius')
      params.delete('location')
    }
    
    // Update URL without reloading
    router.push(`/kart?${params.toString()}`, { scroll: false })
  }
  
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category)
    
    // Update URL params
    const params = new URLSearchParams(searchParams.toString())
    
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    
    // Update URL without reloading
    router.push(`/kart?${params.toString()}`, { scroll: false })
  }
  
  const handleMapBoundsChange = (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
    center: { lat: number, lng: number };
  }) => {
    // Only update bounds if we're not searching by text
    if (!searchQuery.trim()) {
      setMapBounds(bounds)
    }
  }
  
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    // Don't clear map bounds when searching - this allows the map to maintain its position
    // Remove: if (query.trim()) { setMapBounds(null) }
    
    // Don't update URL on every keystroke - only update after 500ms of inactivity
    // This is handled in the MapSearchBar component with debounce
  }
  
  // Use a separate function for URL updates that can be called less frequently
  const updateUrlWithQuery = (query: string) => {
    // Update URL params
    const params = new URLSearchParams(searchParams.toString())
    
    if (query.trim()) {
      params.set('query', query)
    } else {
      params.delete('query')
    }
    
    // Update URL without reloading
    router.push(`/kart?${params.toString()}`, { scroll: false })
  }
  
  // Update URL when search query changes, but debounced
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateUrlWithQuery(searchQuery);
    }, 800); // Only update URL after 800ms of no typing
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  return (
    <div className="flex flex-col h-screen">
      <div className="container py-4 px-4 lg:px-6">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <MapSearchBar 
            onLocationSelect={handleLocationSelect} 
            onSearch={handleSearch}
            selectedLocation={selectedLocation}
            searchQuery={searchQuery}
          />
          <div className="flex-shrink-0">
            <ToggleView activeView={activeView} onViewChange={handleViewToggle} />
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <CategoryScrollbar 
            selectedCategory={selectedCategory} 
            onCategorySelect={handleCategorySelect} 
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {/* Grid/List View */}
        {(activeView === 'list' || (activeView === 'split' && !isMobile)) && (
          <motion.div 
            className={cn(
              "h-full overflow-y-auto",
              activeView === 'list' ? 'w-full' : 'w-full md:w-1/2 lg:w-2/5'
            )}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MapListingGrid listings={listings} isLoading={isLoading} />
          </motion.div>
        )}
        
        {/* Map View */}
        {(activeView === 'map' || (activeView === 'split' && !isMobile)) && (
          <motion.div 
            className={cn(
              "h-full",
              activeView === 'map' ? 'w-full' : 'w-full md:w-1/2 lg:w-3/5'
            )}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <MapView 
              listings={listings} 
              selectedLocation={selectedLocation}
              isLoading={isLoading}
              onBoundsChange={handleMapBoundsChange}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
} 