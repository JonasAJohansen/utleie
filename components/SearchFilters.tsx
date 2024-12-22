'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
// import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { CalendarIcon } from 'lucide-react'

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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])
  const [category, setCategory] = useState('All Categories')
  const [sortBy, setSortBy] = useState('relevance')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined })
  const [location, setLocation] = useState('')
  const [rating, setRating] = useState(0)

  const handlePriceChange = (value: number[]) => {
    const newPriceRange: [number, number] = [value[0], value[1]]
    setPriceRange(newPriceRange)
    updateFilters({ priceRange: newPriceRange })
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    updateFilters({ category: value })
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    updateFilters({ sortBy: value })
  }

  const handleFeatureToggle = (feature: string) => {
    const updatedFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter(f => f !== feature)
      : [...selectedFeatures, feature]
    setSelectedFeatures(updatedFeatures)
    updateFilters({ features: updatedFeatures })
  }

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range)
    updateFilters({ dateRange: range })
  }

  const handleLocationChange = (value: string) => {
    setLocation(value)
    updateFilters({ location: value })
  }

  const handleRatingChange = (value: number[]) => {
    setRating(value[0])
    updateFilters({ rating: value[0] })
  }

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    onFilterChange({
      priceRange,
      category,
      sortBy,
      features: selectedFeatures,
      dateRange,
      location,
      rating,
      ...newFilters
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="price-range">Price Range</Label>
          <Slider
            id="price-range"
            min={0}
            max={100}
            step={1}
            value={priceRange}
            onValueChange={handlePriceChange}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={handleCategoryChange} value={category}>
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

        <div>
          <Label htmlFor="sort-by">Sort By</Label>
          <Select onValueChange={handleSortChange} value={sortBy}>
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

        <div>
          <Label>Features</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${feature}`}
                  checked={selectedFeatures.includes(feature)}
                  onCheckedChange={() => handleFeatureToggle(feature)}
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

        <div>
          <Label>Date Range</Label>
          <div className="flex space-x-2 mt-2">
            <div className="flex-1">
              <Label htmlFor="start-date" className="text-xs">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateRangeChange({ ...dateRange, from: new Date(e.target.value) })}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end-date" className="text-xs">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateRangeChange({ ...dateRange, to: new Date(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Enter city or zip code"
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="rating">Minimum Rating</Label>
          <Slider
            id="rating"
            min={0}
            max={5}
            step={0.5}
            value={[rating]}
            onValueChange={handleRatingChange}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>{rating} stars</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

