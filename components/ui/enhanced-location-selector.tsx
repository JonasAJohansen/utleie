'use client'

import * as React from "react"
import { useState, useCallback, useEffect } from "react"
import { MapPin, Loader2, Navigation, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useGeolocation } from "@/hooks/use-geolocation"
import { cn } from "@/lib/utils"

interface City {
  name: string
  municipality: string
  county: string
  displayName: string
  isPopular: boolean
}

interface LocationSelectorProps {
  value?: string
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void
  placeholder?: string
  className?: string
  showDetectLocation?: boolean
}

export function EnhancedLocationSelector({ 
  value, 
  onChange, 
  placeholder = "Søk etter sted...",
  className,
  showDetectLocation = true
}: LocationSelectorProps) {
  const [query, setQuery] = useState(value || '')
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [popularCities, setPopularCities] = useState<City[]>([])
  
  const geolocation = useGeolocation()

  // Update query when value prop changes
  useEffect(() => {
    setQuery(value || '')
  }, [value])

  // Fetch popular cities on mount
  useEffect(() => {
    const fetchPopularCities = async () => {
      try {
        const response = await fetch('/api/cities?limit=8')
        if (response.ok) {
          const data = await response.json()
          setPopularCities(data.cities.filter((city: City) => city.isPopular))
        }
      } catch (error) {
        console.error('Error fetching popular cities:', error)
      }
    }
    fetchPopularCities()
  }, [])

  // Debounced search function
  const searchCities = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setCities(popularCities)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/cities?q=${encodeURIComponent(searchQuery)}&limit=20`)
        if (response.ok) {
          const data = await response.json()
          setCities(data.cities)
        }
      } catch (error) {
        console.error('Error searching cities:', error)
        setCities([])
      } finally {
        setIsLoading(false)
      }
    },
    [popularCities]
  )

  // Debounced search with delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, searchCities])

  // Handle location detection
  const handleDetectLocation = () => {
    geolocation.getCurrentPosition()
  }

  // Update field when geolocation succeeds
  useEffect(() => {
    if (geolocation.city && geolocation.coordinates) {
      setQuery(geolocation.city)
      onChange(geolocation.city, {
        lat: geolocation.coordinates.latitude,
        lng: geolocation.coordinates.longitude
      })
      setShowDropdown(false)
    }
  }, [geolocation.city, geolocation.coordinates, onChange])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    setShowDropdown(true)
    
    // Always call onChange to update parent component
    onChange(newValue)
  }

  // Handle clearing the input
  const handleClear = () => {
    setQuery('')
    onChange('')
    setShowDropdown(false)
  }

  // Handle city selection
  const handleCitySelect = (city: City) => {
    setQuery(city.displayName)
    onChange(city.displayName)
    setShowDropdown(false)
  }

  // Handle focus
  const handleFocus = () => {
    setShowDropdown(true)
    if (!query && popularCities.length > 0) {
      setCities(popularCities)
    }
  }

  // Handle blur (with delay to allow for clicks)
  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false)
    }, 200)
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "pl-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
            showDetectLocation && query ? "pr-20" : query ? "pr-12" : showDetectLocation ? "pr-12" : "pr-3"
          )}
        />
        
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Clear button - show when there's a value */}
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Fjern sted"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </Button>
          )}
          
          {/* Location detection button */}
          {showDetectLocation && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDetectLocation}
              disabled={geolocation.isLoading}
              className="h-8 w-8 p-0 hover:bg-emerald-50"
              title="Finn min posisjon"
            >
              {geolocation.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 text-emerald-600" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Error message */}
      {geolocation.error && (
        <p className="text-sm text-red-600 mt-1">{geolocation.error}</p>
      )}

      {/* Dropdown */}
      {showDropdown && (cities.length > 0 || isLoading) && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-[99999] max-h-64 overflow-y-auto shadow-lg border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">Søker...</span>
              </div>
            ) : (
              <>
                {!query && popularCities.length > 0 && (
                  <div className="p-2 border-b">
                    <p className="text-xs font-medium text-gray-500 mb-2">Populære steder</p>
                  </div>
                )}
                
                {cities.map((city, index) => (
                  <button
                    key={`${city.name}-${city.municipality}-${index}`}
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                  >
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">{city.name}</div>
                        {city.county && city.county !== city.name && (
                          <div className="text-sm text-gray-500">{city.county}</div>
                        )}
                      </div>
                    </div>
                    
                    {city.isPopular && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        Populær
                      </span>
                    )}
                  </button>
                ))}
                
                {cities.length === 0 && query && !isLoading && (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Ingen steder funnet for "{query}"
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 