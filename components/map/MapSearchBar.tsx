'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { debounce } from 'lodash'

// Simulated locations for demo purposes
const DEMO_LOCATIONS = [
  { name: 'Oslo', lat: 59.9139, lng: 10.7522 },
  { name: 'Bergen', lat: 60.3913, lng: 5.3221 },
  { name: 'Trondheim', lat: 63.4305, lng: 10.3951 },
  { name: 'Stavanger', lat: 58.9700, lng: 5.7331 },
  { name: 'Tromsø', lat: 69.6492, lng: 18.9553 },
  { name: 'Kristiansand', lat: 58.1599, lng: 8.0182 },
  { name: 'Drammen', lat: 59.7440, lng: 10.2045 }
]

interface MapSearchBarProps {
  onLocationSelect: (location: { lat: number; lng: number; radius: number; name: string } | null) => void
  selectedLocation: { lat: number; lng: number; radius: number; name: string } | null
  onSearch?: (query: string) => void
}

export function MapSearchBar({ onLocationSelect, selectedLocation, onSearch }: MapSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<typeof DEMO_LOCATIONS>([])
  const [radius, setRadius] = useState(5) // Default radius in km
  const searchRef = useRef<HTMLDivElement>(null)
  
  // Create debounced search function with a longer delay
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (onSearch) {
        onSearch(query);
      }
    }, 500), // Increased to 500ms to reduce API calls
    [onSearch]
  );
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filteredLocations = DEMO_LOCATIONS.filter(location => 
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSuggestions(filteredLocations)
      setShowSuggestions(true)
      
      // Only trigger search when query has at least 3 characters
      if (searchQuery.length >= 3) {
        debouncedSearch(searchQuery);
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      
      // Also trigger search with empty query to reset
      if (onSearch) debouncedSearch('');
    }
  }, [searchQuery, debouncedSearch, onSearch])
  
  // Handle location selection
  const handleLocationSelect = (location: typeof DEMO_LOCATIONS[0]) => {
    setSearchQuery(location.name)
    setShowSuggestions(false)
    onLocationSelect({
      lat: location.lat,
      lng: location.lng,
      radius,
      name: location.name
    })
  }
  
  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    
    // Find matching location
    const matchingLocation = DEMO_LOCATIONS.find(
      location => location.name.toLowerCase() === searchQuery.toLowerCase()
    )
    
    if (matchingLocation) {
      handleLocationSelect(matchingLocation)
    } else if (searchQuery.trim()) {
      // In a real app, you'd make an API call to geocode the address
      // For demo, we'll just use the first suggestion if available
      if (suggestions.length > 0) {
        handleLocationSelect(suggestions[0])
      }
      
      // Trigger search with final query
      if (onSearch) onSearch(searchQuery);
    }
    
    setIsSearching(false)
  }
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };
  
  // Handle radius change
  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0]
    setRadius(newRadius)
    
    // Update location with new radius if location is selected
    if (selectedLocation) {
      onLocationSelect({
        ...selectedLocation,
        radius: newRadius
      })
    }
  }
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
    onLocationSelect(null)
    
    // Reset search results
    if (onSearch) onSearch('');
  }
  
  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex items-center w-full">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          
          <Input
            type="text"
            placeholder="Søk etter annonser..."
            value={searchQuery}
            onChange={handleInputChange}
            className="pl-10 pr-8 py-2 h-12 rounded-l-lg border-r-0"
          />
          
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
          <Input
            type="text"
            placeholder="Sted..."
            className="h-12 border-x-0 w-[120px] sm:w-[150px]"
            disabled={isSearching}
            readOnly
            onClick={() => setShowSuggestions(!showSuggestions)}
            value={selectedLocation?.name || ''}
          />
        </div>
        
        <Button 
          type="submit" 
          className="h-12 rounded-r-lg bg-[#4CD964] hover:bg-[#3DAF50]" 
          disabled={isSearching}
        >
          <MapPin className="h-5 w-5" />
          <span className="ml-2 hidden md:inline">Søk</span>
        </Button>
      </form>
      
      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 right-[120px] w-[200px] mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map(location => (
              <div
                key={location.name}
                className="p-3 hover:bg-gray-100 cursor-pointer flex items-center"
                onClick={() => handleLocationSelect(location)}
              >
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span>{location.name}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Radius selector (show only when location is selected) */}
      {selectedLocation && (
        <div className="mt-4 bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="radius-slider">Søkeradius: {radius} km</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              Fjern
            </Button>
          </div>
          <Slider
            id="radius-slider"
            defaultValue={[radius]}
            min={1}
            max={50}
            step={1}
            onValueChange={handleRadiusChange}
            className="w-full"
          />
        </div>
      )}
    </div>
  )
} 