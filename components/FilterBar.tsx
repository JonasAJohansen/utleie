'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Slider } from "./ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

// City interface for API response
interface City {
  name: string
  municipality: string
  county: string
  countyCode: string
  displayName: string
}

interface FilterBarProps {
  onFilterChange?: (filters: FilterState) => void
}

interface FilterState {
  minPrice: number
  maxPrice: number
  location: string
  sortBy: string
  rating: number
}

const initialState: FilterState = {
  minPrice: 0,
  maxPrice: 1000,
  location: '',
  sortBy: 'newest',
  rating: 0
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>(initialState)
  const [priceInputs, setPriceInputs] = useState({
    minPrice: '0',
    maxPrice: '1000'
  })
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [allCities, setAllCities] = useState<City[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Load all cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoadingCities(true)
        const response = await fetch('/api/cities?limit=100')
        if (response.ok) {
          const data = await response.json()
          setAllCities(data.cities || [])
        }
      } catch (error) {
        console.error('Error loading cities:', error)
        // Fallback to empty array - the API has its own fallback
        setAllCities([])
      } finally {
        setLoadingCities(false)
      }
    }

    loadCities()
  }, [])

  useEffect(() => {
    // Update filters from URL params
    const newFilters = { ...initialState }
    if (searchParams.has('minPrice')) newFilters.minPrice = Number(searchParams.get('minPrice'))
    if (searchParams.has('maxPrice')) newFilters.maxPrice = Number(searchParams.get('maxPrice'))
    if (searchParams.has('location')) newFilters.location = searchParams.get('location')!
    if (searchParams.has('sortBy')) newFilters.sortBy = searchParams.get('sortBy')!
    if (searchParams.has('rating')) newFilters.rating = Number(searchParams.get('rating'))
    setFilters(newFilters)
    
    // Update price input display values
    setPriceInputs({
      minPrice: newFilters.minPrice.toString(),
      maxPrice: newFilters.maxPrice.toString()
    })
  }, [searchParams])

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Update URL with new filters
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== initialState[key as keyof FilterState]) {
        params.set(key, String(value))
      } else {
        params.delete(key)
      }
    })

    // Keep existing search query if it exists
    const query = searchParams.get('q')
    if (query) params.set('q', query)

    // Update URL without refreshing the page
    router.push(`?${params.toString()}`, { scroll: false })

    // Notify parent component
    if (onFilterChange) {
      onFilterChange(updatedFilters)
    }
  }

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    // Only update the display value, don't trigger search
    setPriceInputs(prev => ({ ...prev, [field]: value }))
  }

  const formatPriceInput = (field: 'minPrice' | 'maxPrice') => {
    const value = priceInputs[field]
    if (value === '') return
    
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      const formattedValue = numValue.toString()
      setPriceInputs(prev => ({ ...prev, [field]: formattedValue }))
    }
  }

  const searchCities = async (query: string) => {
    if (query.length === 0) {
      setFilteredCities([])
      setShowLocationSuggestions(false)
      return
    }

    try {
      const response = await fetch(`/api/cities?q=${encodeURIComponent(query)}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setFilteredCities(data.cities || [])
        setShowLocationSuggestions((data.cities || []).length > 0)
      } else {
        // Fallback to local filtering if API fails
        const filtered = allCities.filter(city =>
          city.name.toLowerCase().includes(query.toLowerCase()) ||
          city.municipality.toLowerCase().includes(query.toLowerCase()) ||
          city.county.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10)
        setFilteredCities(filtered)
        setShowLocationSuggestions(filtered.length > 0)
      }
    } catch (error) {
      console.error('Error searching cities:', error)
      // Fallback to local filtering
      const filtered = allCities.filter(city =>
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.municipality.toLowerCase().includes(query.toLowerCase()) ||
        city.county.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
      setFilteredCities(filtered)
      setShowLocationSuggestions(filtered.length > 0)
    }
  }

  const handleLocationChange = (value: string) => {
    updateFilters({ location: value })
    
    // Search cities with debouncing
    searchCities(value)
  }

  const selectCity = (city: City) => {
    updateFilters({ location: city.name })
    setShowLocationSuggestions(false)
  }

  const handleSearch = () => {
    // Parse current price input values
    const minPrice = parseFloat(priceInputs.minPrice) || 0
    const maxPrice = parseFloat(priceInputs.maxPrice) || 1000
    
    // Update filters with current values including prices
    const currentFilters = {
      ...filters,
      minPrice,
      maxPrice
    }
    
    // Navigate to listings page with current filters
    const params = new URLSearchParams()
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value !== initialState[key as keyof FilterState]) {
        params.set(key, String(value))
      }
    })

    // Keep existing search query if it exists
    const query = searchParams.get('q')
    if (query) params.set('q', query)

    // Navigate to search results
    router.push(`/listings?${params.toString()}`)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Price Range (per day)</h3>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={priceInputs.minPrice}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            onBlur={() => formatPriceInput('minPrice')}
            className="w-24"
            placeholder="Min"
          />
          <span>to</span>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={priceInputs.maxPrice}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            onBlur={() => formatPriceInput('maxPrice')}
            className="w-24"
            placeholder="Max"
          />
        </div>
      </div>

      <div className="relative">
        <h3 className="text-sm font-medium mb-2">Location</h3>
        <Input
          type="text"
          value={filters.location}
          onChange={(e) => handleLocationChange(e.target.value)}
          onFocus={() => {
            if (filters.location.length > 0) {
              searchCities(filters.location)
            }
          }}
          onBlur={() => {
            // Delay hiding suggestions to allow for clicks
            setTimeout(() => setShowLocationSuggestions(false), 150)
          }}
          placeholder="Enter Norwegian city..."
          disabled={loadingCities}
        />
        {showLocationSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredCities.map((city, index) => (
              <div
                key={`${city.name}-${city.municipality}-${index}`}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                onMouseDown={(e) => {
                  e.preventDefault() // Prevent onBlur from firing
                  selectCity(city)
                }}
              >
                <div className="font-medium">{city.name}</div>
                {city.municipality && city.municipality !== city.name && (
                  <div className="text-xs text-gray-500">{city.municipality}</div>
                )}
                {city.county && (
                  <div className="text-xs text-gray-400">{city.county}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Minimum Rating</h3>
        <Select
          value={String(filters.rating)}
          onValueChange={(value) => updateFilters({ rating: Number(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select minimum rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any rating</SelectItem>
            <SelectItem value="3">3+ stars</SelectItem>
            <SelectItem value="4">4+ stars</SelectItem>
            <SelectItem value="4.5">4.5+ stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Sort By</h3>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => updateFilters({ sortBy: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        onClick={handleSearch}
        className="w-full"
        disabled={loadingCities}
      >
        {loadingCities ? 'Loading...' : 'Search'}
      </Button>
    </div>
  )
} 