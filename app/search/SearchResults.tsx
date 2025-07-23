'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from 'lucide-react'
import { ItemGrid } from '@/components/ItemGrid'
import { SearchFilters, SearchFilters as SearchFiltersType } from '@/components/SearchFilters'

// This would typically come from a database or API
const allItems = [
  { id: 1, name: 'Mountain Bike', price: 25, image: '/placeholder.svg?height=200&width=300', rating: 4.5, location: 'Denver, CO', priceType: 'day', category: 'Sports & Outdoors', features: ['Free Delivery', 'Damage Protection'] },
  { id: 2, name: 'DSLR Camera', price: 40, image: '/placeholder.svg?height=200&width=300', rating: 4.8, location: 'New York, NY', priceType: 'day', category: 'Electronics', features: ['Instant Book', 'Flexible Cancellation'] },
  { id: 3, name: 'Camping Tent', price: 30, image: '/placeholder.svg?height=200&width=300', rating: 4.2, location: 'Portland, OR', priceType: 'day', category: 'Sports & Outdoors', features: ['Pet Friendly', 'Long Term Rental'] },
  { id: 4, name: 'Surfboard', price: 35, image: '/placeholder.svg?height=200&width=300', rating: 4.7, location: 'Los Angeles, CA', priceType: 'day', category: 'Sports & Outdoors', features: ['Free Delivery', 'Damage Protection'] },
  { id: 5, name: 'Electric Scooter', price: 15, image: '/placeholder.svg?height=200&width=300', rating: 4.6, location: 'San Francisco, CA', priceType: 'day', category: 'Vehicles', features: ['Instant Book', 'Flexible Cancellation'] },
]

export default function SearchResults() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState<SearchFiltersType>({
    priceRange: [0, 100],
    category: 'All Categories',
    subcategory: 'all',
    sortBy: 'relevance',
    features: [],
    dateRange: { from: undefined, to: undefined },
    location: '',
    rating: 0,
    freeItemsOnly: false
  })
  const [searchResults, setSearchResults] = useState(allItems)

  useEffect(() => {
    performSearch()
  }, [searchQuery, filters])

  const performSearch = () => {
    const filteredResults = allItems.filter(item => 
      (searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filters.category === 'All Categories' || item.category === filters.category) &&
      (item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1]) &&
      (filters.features.length === 0 || filters.features.every(feature => item.features.includes(feature))) &&
      (filters.location === '' || item.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (item.rating >= filters.rating)
    )

    // Apply sorting
    filteredResults.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return a.price - b.price
        case 'price_desc':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        default:
          return 0
      }
    })

    setSearchResults(filteredResults)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const handleFilterChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="What would you like to rent?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <SearchFilters onFilterChange={handleFilterChange} />
        </div>
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{searchResults.length} items found</p>
              <ItemGrid items={searchResults} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

