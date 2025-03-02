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
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white pt-20">
      {/* Fixed header with search bar */}
      <header className="sticky top-16 z-10 bg-white shadow-sm py-4 px-4 border-b">
        <div className="container mx-auto max-w-7xl">
          <MapSearchBar 
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
            onSearch={handleSearch}
          />
          
          <div className="mt-4">
            <CategoryScrollbar 
              selectedCategory={selectedCategory} 
              onCategorySelect={handleCategorySelect}
            />
          </div>
        </div>
      </header>
      
      {/* Mobile view toggle */}
      {isMobile && (
        <div className="flex justify-center py-2 bg-white border-b">
          <ToggleView activeView={activeView} onViewChange={handleViewToggle} />
        </div>
      )}
      
      {/* Main content area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Listings section - hidden on mobile map view */}
        <motion.div 
          className="flex-1 overflow-y-auto"
          initial={{ width: '100%' }}
          animate={{ 
            width: activeView === 'map' && !isMobile ? '0%' : 
                   activeView === 'split' && !isMobile ? '50%' : '100%',
            display: activeView === 'map' && !isMobile ? 'none' : 'block'
          }}
          transition={{ duration: 0.3 }}
          style={{ display: isMobile && activeView === 'map' ? 'none' : 'block' }}
        >
          <MapListingGrid listings={listings} isLoading={isLoading} />
        </motion.div>
        
        {/* Map section - full width on map view, 50% on split view */}
        {showMap && (
          <motion.div 
            className="h-full bg-gray-100"
            initial={{ width: isMobile ? '100%' : '50%' }}
            animate={{ 
              width: activeView === 'list' && !isMobile ? '0%' : 
                     activeView === 'split' && !isMobile ? '50%' : '100%',
              display: activeView === 'list' && !isMobile ? 'none' : 'block'
            }}
            transition={{ duration: 0.3 }}
            style={{ 
              display: isMobile && activeView === 'list' ? 'none' : 'block',
              height: isMobile ? 'calc(100vh - 200px)' : '100%'
            }}
          >
            <MapView 
              listings={listings} 
              selectedLocation={selectedLocation}
              isLoading={isLoading}
              onBoundsChange={handleMapBoundsChange}
            />
          </motion.div>
        )}
      </main>
    </div>
  )
} 