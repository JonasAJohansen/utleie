'use client'

import { useState, useEffect } from 'react'
import { useUser } from "@clerk/nextjs"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface SavedSearch {
  id: string
  search_query: {
    q?: string
    minPrice?: string
    maxPrice?: string
    location?: string
    category?: string
    sortBy?: string
  }
  created_at: string
}

export default function SavedSearchesPage() {
  const { user } = useUser()
  const router = useRouter()
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSavedSearches() {
      if (!user) return

      try {
        const response = await fetch('/api/saved-searches')
        if (response.ok) {
          const data = await response.json()
          setSavedSearches(data)
        }
      } catch (error) {
        console.error('Error fetching saved searches:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSavedSearches()
  }, [user])

  const handleSearch = (searchQuery: SavedSearch['search_query']) => {
    const params = new URLSearchParams()
    Object.entries(searchQuery).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    router.push(`/search?${params.toString()}`)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/saved-searches/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavedSearches(prev => prev.filter(search => search.id !== id))
      }
    } catch (error) {
      console.error('Error deleting saved search:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Searches</CardTitle>
      </CardHeader>
      <CardContent>
        {savedSearches.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">You haven't saved any searches yet.</p>
            <Button asChild>
              <Link href="/search">Start Searching</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedSearches.map((search) => (
              <div 
                key={search.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">
                    {search.search_query.q || 'All Items'}
                    {search.search_query.location && ` in ${search.search_query.location}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Saved on {new Date(search.created_at).toLocaleDateString()}
                  </p>
                  {(search.search_query.minPrice || search.search_query.maxPrice) && (
                    <p className="text-sm text-gray-500">
                      Price: 
                      {search.search_query.minPrice && ` $${search.search_query.minPrice}`}
                      {search.search_query.minPrice && search.search_query.maxPrice && ' -'}
                      {search.search_query.maxPrice && ` $${search.search_query.maxPrice}`}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSearch(search.search_query)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(search.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

