'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchBar } from '@/components/SearchBar'
import { SearchFilters as SearchFiltersComponent } from '@/components/SearchFilters'
import { ItemGrid } from '@/components/ItemGrid'
import { Pagination } from '@/components/ui/pagination'
import { SearchResultsGrid, FiltersSkeleton } from "@/components/ui/search-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedContainer } from "@/components/ui/animated-container"

interface SearchFiltersState {
  priceRange: [number, number]
  category: string
  sortBy: string
  features: string[]
  dateRange: { from: Date | undefined; to: Date | undefined }
  location: string
  rating: number
}

interface SearchResponse {
  items: any[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize filters from URL parameters
  const initialFilters: SearchFiltersState = {
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
  }

  useEffect(() => {
    async function performSearch() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?${searchParams.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data)
        }
      } catch (error) {
        console.error('Error performing search:', error)
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [searchParams])

  const handleFilterChange = (filters: SearchFiltersState) => {
    const params = new URLSearchParams(searchParams)
    
    // Reset page when filters change
    params.delete('page')
    
    // Update filters in URL
    if (filters.priceRange[0] > 0) params.set('minPrice', filters.priceRange[0].toString())
    else params.delete('minPrice')
    
    if (filters.priceRange[1] < 100) params.set('maxPrice', filters.priceRange[1].toString())
    else params.delete('maxPrice')
    
    if (filters.category !== 'All Categories') params.set('category', filters.category)
    else params.delete('category')
    
    if (filters.sortBy !== 'relevance') params.set('sortBy', filters.sortBy)
    else params.delete('sortBy')
    
    if (filters.features.length > 0) params.set('features', filters.features.join(','))
    else params.delete('features')
    
    if (filters.location) params.set('location', filters.location)
    else params.delete('location')
    
    if (filters.rating > 0) params.set('rating', filters.rating.toString())
    else params.delete('rating')

    router.push(`/search?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <SearchBar initialQuery={searchParams.get('q') || ''} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <AnimatedContainer isLoading={isLoading}>
            {isLoading ? (
              <FiltersSkeleton />
            ) : (
              <SearchFiltersComponent 
                onFilterChange={handleFilterChange} 
              />
            )}
          </AnimatedContainer>
        </aside>

        <main className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatedContainer isLoading={isLoading}>
                {isLoading ? (
                  <>
                    <Skeleton className="h-6 w-48 mb-6" />
                    <SearchResultsGrid />
                  </>
                ) : searchResults?.items.length ? (
                  <>
                    <p className="mb-4 transition-opacity duration-300">
                      {searchResults.pagination.totalItems} results found
                      {searchResults.pagination.totalPages > 1 && 
                        ` - Page ${searchResults.pagination.currentPage} of ${searchResults.pagination.totalPages}`
                      }
                    </p>
                    <div className="transition-all duration-300">
                      <ItemGrid items={searchResults.items} />
                    </div>
                    {searchResults.pagination.totalPages > 1 && (
                      <div className="mt-6 transition-opacity duration-300">
                        <Pagination
                          currentPage={searchResults.pagination.currentPage}
                          totalPages={searchResults.pagination.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 transition-all duration-300">
                    <h2 className="text-2xl font-semibold mb-4">No results found</h2>
                    <p className="text-gray-600">
                      Try adjusting your search criteria or filters to find what you're looking for.
                    </p>
                  </div>
                )}
              </AnimatedContainer>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

