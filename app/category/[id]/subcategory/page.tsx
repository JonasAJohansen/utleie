'use client'

import React from 'react'
import { useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from 'lucide-react'
import { ItemGrid } from '@/components/ItemGrid'
import { SearchFilters } from '@/components/SearchFilters'
import type { SearchFilters as SearchFiltersType } from '@/components/SearchFilters'
import { categories } from '@/lib/categoryData'

// This would typically come from a database or API
const allItems = [
  { id: 1, name: 'Mountain Bike', price: 25, image: '/placeholder.svg?height=200&width=300', rating: 4.5, location: 'Denver, CO', priceType: 'day', category: 'Sports & Outdoors', subcategory: 'Cycling', features: ['Free Delivery', 'Damage Protection'] },
  { id: 2, name: 'Camping Tent', price: 30, image: '/placeholder.svg?height=200&width=300', rating: 4.2, location: 'Portland, OR', priceType: 'day', category: 'Sports & Outdoors', subcategory: 'Camping & Hiking', features: ['Pet Friendly', 'Long Term Rental'] },
  { id: 3, name: 'Surfboard', price: 35, image: '/placeholder.svg?height=200&width=300', rating: 4.7, location: 'Los Angeles, CA', priceType: 'day', category: 'Sports & Outdoors', subcategory: 'Water Sports', features: ['Free Delivery', 'Damage Protection'] },
  { id: 4, name: 'DSLR Camera', price: 40, image: '/placeholder.svg?height=200&width=300', rating: 4.8, location: 'New York, NY', priceType: 'day', category: 'Electronics', subcategory: 'Cameras', features: ['Instant Book', 'Flexible Cancellation'] },
  { id: 5, name: 'Lawn Mower', price: 30, image: '/placeholder.svg?height=200&width=300', rating: 4.4, location: 'Chicago, IL', priceType: 'day', category: 'Home & Garden', subcategory: 'Garden Equipment', features: ['Pet Friendly', 'Long Term Rental'] },
]

export default function SubcategoryPage({ params }: { params: { id: string, subId: string } }) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [items, setItems] = React.useState(allItems)

  useEffect(() => {
    // Filter items based on category and subcategory
    const filteredItems = allItems.filter(item => 
      item.category === getCategoryName(params.id) && 
      item.subcategory === getSubcategoryName(params.id, params.subId)
    )
    setItems(filteredItems)
  }, [params.id, params.subId])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search logic here
    console.log('Search query:', searchQuery)
  }

  const handleFilterChange = (newFilters: SearchFiltersType) => {
    // Implement filter logic here
    console.log('New filters:', newFilters)
    // You would typically use these filters to update the 'items' state
  }

  // These functions would typically fetch data from your backend
  const getCategoryName = (id: string) => {
    const category = categories.find(c => c.id === parseInt(id))
    return category ? category.name : ''
  }

  const getSubcategoryName = (categoryId: string, subcategoryId: string) => {
    const category = categories.find(c => c.id === parseInt(categoryId))
    const subcategory = category?.subcategories.find(sc => sc.id === parseInt(subcategoryId))
    return subcategory ? subcategory.name : ''
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{getCategoryName(params.id)} - {getSubcategoryName(params.id, params.subId)}</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search in this subcategory..."
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
              <CardTitle>Items in {getSubcategoryName(params.id, params.subId)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{items.length} items found</p>
              <ItemGrid items={items} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

