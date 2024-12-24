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
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Update filters from URL params
    const newFilters = { ...initialState }
    if (searchParams.has('minPrice')) newFilters.minPrice = Number(searchParams.get('minPrice'))
    if (searchParams.has('maxPrice')) newFilters.maxPrice = Number(searchParams.get('maxPrice'))
    if (searchParams.has('location')) newFilters.location = searchParams.get('location')!
    if (searchParams.has('sortBy')) newFilters.sortBy = searchParams.get('sortBy')!
    if (searchParams.has('rating')) newFilters.rating = Number(searchParams.get('rating'))
    setFilters(newFilters)
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Price Range (per day)</h3>
        <div className="flex items-center space-x-4">
          <Input
            type="number"
            value={filters.minPrice}
            onChange={(e) => updateFilters({ minPrice: Number(e.target.value) })}
            className="w-24"
            placeholder="Min"
          />
          <span>to</span>
          <Input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => updateFilters({ maxPrice: Number(e.target.value) })}
            className="w-24"
            placeholder="Max"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Location</h3>
        <Input
          type="text"
          value={filters.location}
          onChange={(e) => updateFilters({ location: e.target.value })}
          placeholder="Enter location"
        />
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
        onClick={() => {
          setFilters(initialState)
          router.push(searchParams.get('q') ? `?q=${searchParams.get('q')}` : '', { scroll: false })
        }}
        className="w-full"
      >
        Reset Filters
      </Button>
    </div>
  )
} 