'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { debounce } from 'lodash'
import { SearchableDropdown } from '@/components/ui/searchable-dropdown'

// City interface for API response
interface City {
  name: string
  municipality: string
  county: string
  countyCode: string
  displayName: string
}

// Location interface for map
interface Location {
  name: string
  lat: number
  lng: number
}

// Default coordinates for major Norwegian cities (fallback)
const DEFAULT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'oslo': { lat: 59.9139, lng: 10.7522 },
  'bergen': { lat: 60.3913, lng: 5.3221 },
  'trondheim': { lat: 63.4305, lng: 10.3951 },
  'stavanger': { lat: 58.9700, lng: 5.7331 },
  'tromsø': { lat: 69.6492, lng: 18.9553 },
  'kristiansand': { lat: 58.1599, lng: 8.0182 },
  'drammen': { lat: 59.7440, lng: 10.2045 },
  'fredrikstad': { lat: 59.2181, lng: 10.9298 },
  'sandnes': { lat: 58.8516, lng: 5.7372 },
  'sarpsborg': { lat: 59.2839, lng: 11.1094 }
}

interface MapSearchBarProps {
  onLocationSelect: (location: { lat: number; lng: number; radius: number; name: string } | null) => void
  selectedLocation: { lat: number; lng: number; radius: number; name: string } | null
  onSearch?: (query: string) => void
  searchQuery?: string
}

export function MapSearchBar({ onLocationSelect, selectedLocation, onSearch, searchQuery = '' }: MapSearchBarProps) {
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [isSearching, setIsSearching] = useState(false)
  const [radius, setRadius] = useState(5) // Default radius in km
  const [selectedLocationValue, setSelectedLocationValue] = useState('')
  
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
  
  // Convert city to location with coordinates
  const cityToLocation = (cityName: string): Location => {
    const cityKey = cityName.toLowerCase()
    const coords = DEFAULT_COORDINATES[cityKey] || { lat: 59.9139, lng: 10.7522 } // Default to Oslo
    
    return {
      name: cityName,
      lat: coords.lat,
      lng: coords.lng
    }
  }
  
  // Handle location selection from dropdown
  const handleLocationChange = (value: string) => {
    setSelectedLocationValue(value)
      
    // Convert the value back to proper city name (capitalize first letter)
    const cityName = value.charAt(0).toUpperCase() + value.slice(1)
    const location = cityToLocation(cityName)
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
    
    // Trigger search with current query
    if (onSearch && searchInput.trim()) {
      onSearch(searchInput);
    }
    
    setIsSearching(false)
  }
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Only trigger search when query has at least 3 characters
    if (value.length >= 3) {
      debouncedSearch(value);
    } else if (value.length === 0) {
      // Also trigger search with empty query to reset
      if (onSearch) debouncedSearch('');
    }
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
    setSearchInput('')
    setSelectedLocationValue('')
    onLocationSelect(null)
    
    // Reset search results
    if (onSearch) onSearch('');
  }
  
  // Update selectedLocationValue when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      setSelectedLocationValue(selectedLocation.name.toLowerCase())
    } else {
      setSelectedLocationValue('')
    }
  }, [selectedLocation])
  
  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex items-center w-full">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          
          <Input
            type="text"
            placeholder="Søk etter annonser..."
            value={searchInput}
            onChange={handleInputChange}
            className="pl-10 pr-8 py-2 h-12 rounded-l-lg border-r-0"
          />
          
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('')
                if (onSearch) onSearch('')
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
          <div className="h-12 border-x-0 w-[120px] sm:w-[150px] flex items-center">
            <SearchableDropdown
              value={selectedLocationValue}
              onValueChange={handleLocationChange}
              placeholder={isSearching ? "Laster..." : "Sted..."}
              searchPlaceholder="Søk etter sted..."
              className="w-full border-none"
            disabled={isSearching}
              apiEndpoint="/api/cities"
              staticItems={false}
          />
          </div>
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