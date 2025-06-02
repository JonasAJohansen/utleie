'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Bookmark } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"

interface SearchFiltersProps {
  onFilterChange: (filters: SearchFilters) => void
}

export interface SearchFilters {
  priceRange: [number, number]
  category: string
  sortBy: string
  features: string[]
  dateRange: { from: Date | undefined; to: Date | undefined }
  location: string
  rating: number
}

const categories = [
  'All Categories',
  'Sports & Outdoors',
  'Electronics',
  'Home & Garden',
  'Vehicles',
  'Fashion',
  'Tools',
]

const features = [
  'Free Delivery',
  'Instant Book',
  'Pet Friendly',
  'Long Term Rental',
  'Damage Protection',
  'Flexible Cancellation',
]

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useUser()
  
  // Initialize state from URL parameters
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [
      Number(searchParams.get('minPrice')) || 0,
      Number(searchParams.get('maxPrice')) || 100
    ],
    category: searchParams.get('category') || 'All Categories',
    sortBy: searchParams.get('sortBy') || 'relevance',
    features: searchParams.get('features')?.split(',') || [],
    dateRange: {
      from: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      to: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined
    },
    location: searchParams.get('location') || '',
    rating: Number(searchParams.get('rating')) || 0
  })

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
    
    // Update URL with new filters
    const params = new URLSearchParams(searchParams)
    
    if (updatedFilters.priceRange) {
      params.set('minPrice', updatedFilters.priceRange[0].toString())
      params.set('maxPrice', updatedFilters.priceRange[1].toString())
    }
    if (updatedFilters.category !== 'All Categories') {
      params.set('category', updatedFilters.category)
    } else {
      params.delete('category')
    }
    if (updatedFilters.sortBy !== 'relevance') {
      params.set('sortBy', updatedFilters.sortBy)
    } else {
      params.delete('sortBy')
    }
    if (updatedFilters.features.length > 0) {
      params.set('features', updatedFilters.features.join(','))
    } else {
      params.delete('features')
    }
    if (updatedFilters.location) {
      params.set('location', updatedFilters.location)
    } else {
      params.delete('location')
    }
    if (updatedFilters.rating > 0) {
      params.set('rating', updatedFilters.rating.toString())
    } else {
      params.delete('rating')
    }

    router.push(`/search?${params.toString()}`)
  }

  const handleSaveSearch = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save searches",
        variant: "destructive",
      })
      return
    }

    try {
      const searchQueryObj: Record<string, string> = {}
      searchParams.forEach((value, key) => {
        searchQueryObj[key] = value
      })

      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchQuery: searchQueryObj,
        }),
      })

      if (response.ok) {
        toast({
          title: "Search saved",
          description: "You can access your saved searches in your profile",
        })
      } else {
        throw new Error('Failed to save search')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save search. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRatingChange = (value: number[]) => {
    // Ensure we always have two values for the price range
    updateFilters({ rating: value[0] })
  }

  const handlePriceRangeChange = (value: number[]) => {
    // Ensure we always have two values for the price range
    if (value.length === 2) {
      updateFilters({ priceRange: [value[0], value[1]] })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filters</CardTitle>
        {searchParams.size > 0 && (
          <div className="transition-all duration-300 ease-in-out">
            <Button variant="outline" size="sm" onClick={handleSaveSearch}>
              <Bookmark className="h-4 w-4 mr-2" />
              Save Search
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="price-range">Price Range</Label>
          <Slider
            id="price-range"
            min={0}
            max={100}
            step={1}
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>{filters.priceRange[0]} kr</span>
            <span>{filters.priceRange[1]} kr</span>
          </div>
        </div>

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={(value) => updateFilters({ category: value })} value={filters.category}>
            <SelectTrigger id="category" className="mt-2">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="sort-by">Sort By</Label>
          <Select onValueChange={(value) => updateFilters({ sortBy: value })} value={filters.sortBy}>
            <SelectTrigger id="sort-by" className="mt-2">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="features">Features</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${feature}`}
                  checked={filters.features.includes(feature)}
                  onCheckedChange={() => updateFilters({ features: filters.features.includes(feature) ? filters.features.filter(f => f !== feature) : [...filters.features, feature] })}
                />
                <label
                  htmlFor={`feature-${feature}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={filters.dateRange.from ? filters.dateRange.from.toISOString().split('T')[0] : ''}
            onChange={(e) => updateFilters({ dateRange: { ...filters.dateRange, from: new Date(e.target.value) } })}
          />
        </div>

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="end-date">End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={filters.dateRange.to ? filters.dateRange.to.toISOString().split('T')[0] : ''}
            onChange={(e) => updateFilters({ dateRange: { ...filters.dateRange, to: new Date(e.target.value) } })}
          />
        </div>

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Enter city or zip code"
            value={filters.location}
            onChange={(e) => updateFilters({ location: e.target.value })}
            className="mt-2"
          />
        </div>

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="rating">Minimum Rating</Label>
          <Slider
            id="rating"
            min={0}
            max={5}
            step={0.5}
            value={[filters.rating]}
            onValueChange={handleRatingChange}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>{filters.rating} stars</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

