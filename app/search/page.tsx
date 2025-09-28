'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchBar } from '@/components/SearchBar'
import { SearchFilters as SearchFiltersComponent } from '@/components/SearchFilters'
import { CategoryFilter } from '@/components/ui/category-filter'
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
  categoryCount: {
    name: string
    id: string
    count: number
  }[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

function SearchContent() {
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

  const handleCategorySelect = (categoryName: string | null) => {
    const params = new URLSearchParams(searchParams)
    
    // Reset page when category changes
    params.delete('page')
    
    if (categoryName) {
      params.set('category', categoryName)
    } else {
      params.delete('category')
    }
    
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b">
        <div className="container mx-auto">
          <div className="relative">
            <SearchBar initialQuery={searchParams.get('q') || ''} />
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <aside className="md:col-span-1 relative space-y-6">
            {/* Category Filter */}
            <AnimatedContainer isLoading={isLoading}>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : searchResults?.categoryCount && searchResults.categoryCount.length > 0 ? (
                <CategoryFilter
                  categories={searchResults.categoryCount}
                  selectedCategory={searchParams.get('category') || undefined}
                  onCategorySelect={handleCategorySelect}
                  totalResults={searchResults.pagination.totalItems}
                />
              ) : null}
            </AnimatedContainer>

            {/* Other Filters */}
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
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="transition-opacity duration-300">
                            {searchResults.pagination.totalItems} results found
                            {searchParams.get('category') && (
                              <span className="text-emerald-600 font-medium">
                                {' '}in {searchParams.get('category')}
                              </span>
                            )}
                            {searchResults.pagination.totalPages > 1 && 
                              ` - Page ${searchResults.pagination.currentPage} of ${searchResults.pagination.totalPages}`
                            }
                          </p>
                          {searchParams.get('q') && (
                            <p className="text-sm text-gray-500 mt-1">
                              Search results for "{searchParams.get('q')}"
                            </p>
                          )}
                        </div>
                      </div>
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
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}

