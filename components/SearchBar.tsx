'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import { SearchDropdown } from "@/components/ui/search-dropdown"
import { EnhancedLocationSelector } from "@/components/ui/enhanced-location-selector"
import { SearchAutocomplete } from "@/components/ui/search-autocomplete"
import { useGeolocation } from "@/hooks/use-geolocation"

interface SearchBarProps {
  initialQuery?: string
}

interface Category {
  value: string
                                                  label: string
}

function SearchBarContent({ initialQuery = '' }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [location, setLocation] = useState('')
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [category, setCategory] = useState('all')
  const [categories, setCategories] = useState<Category[]>([
    { value: "all", label: "Alle kategorier" }
  ])
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useUser()
  const geolocation = useGeolocation()

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          const dynamicCategories = [
            { value: "all", label: "Alle kategorier" },
            ...data.map((cat: any) => ({
              value: cat.name.toLowerCase(),
              label: cat.name
            }))
          ]
          setCategories(dynamicCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Keep default categories if fetch fails
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const query = searchParams.get('q')
    const loc = searchParams.get('location')
    const cat = searchParams.get('category')
    if (query) {
      setSearchQuery(query)
    }
    if (loc) {
      setLocation(loc)
    }
    if (cat) {
      setCategory(cat)
    }
  }, [searchParams])

  const handleLocationChange = (value: string, coordinates?: { lat: number; lng: number }) => {
    setLocation(value)
    setUserCoordinates(coordinates || null)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim() || location.trim()) {
      const params = new URLSearchParams()
      
      if (searchQuery.trim()) {
        params.set('query', searchQuery.trim())
      }
      
      if (location.trim()) {
        params.set('location', location.trim())
      }
      
      if (category && category !== 'all') {
        params.set('category', category)
      }

      // Include user coordinates for distance-based sorting
      if (userCoordinates) {
        params.set('lat', userCoordinates.lat.toString())
        params.set('lng', userCoordinates.lng.toString())
      }
      
      router.push(`/search?${params.toString()}`)
    }
  }

  const handleSaveSearch = async () => {
    if (!user) {
      toast({
        title: "Innlogging kreves",
        description: "Vennligst logg inn for å lagre søk",
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
          title: "Søk lagret",
          description: "Du kan finne dine lagrede søk i profilen din",
        })
      } else {
        throw new Error('Failed to save search')
      }
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke lagre søket. Vennligst prøv igjen.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-lg">
        <SearchDropdown
          value={category}
          onValueChange={setCategory}
          items={categories}
          placeholder="Alle kategorier"
          className="w-[180px]"
        />

        <SearchAutocomplete
          value={searchQuery}
          onChange={setSearchQuery}
          onSuggestionSelect={(suggestion) => {
            setSearchQuery(suggestion)
            // Auto-submit search when suggestion is selected
            setTimeout(() => {
              if (suggestion.trim() || location.trim()) {
                const params = new URLSearchParams()
                
                if (suggestion.trim()) {
                  params.set('query', suggestion.trim())
                }
                
                if (location.trim()) {
                  params.set('location', location.trim())
                }
                
                if (category && category !== 'all') {
                  params.set('category', category)
                }

                if (userCoordinates) {
                  params.set('lat', userCoordinates.lat.toString())
                  params.set('lng', userCoordinates.lng.toString())
                }
                
                router.push(`/search?${params.toString()}`)
              }
            }, 100)
          }}
          placeholder="Hva vil du leie?"
          className="flex-1"
        />

        <EnhancedLocationSelector
          value={location}
          onChange={handleLocationChange}
          placeholder="Velg sted..."
          className="w-[200px]"
          showDetectLocation={true}
        />

        <Button 
          type="submit" 
          size="icon" 
          className="rounded-full bg-emerald-500 hover:bg-emerald-600"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Søk</span>
        </Button>

        {searchParams.size > 0 && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleSaveSearch}
            className="rounded-full bg-white border-2 border-gray-200 hover:bg-gray-100"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Lagre søk</span>
          </Button>
        )}
      </div>

      {/* Mobile & Tablet Layout */}
      <div className="lg:hidden bg-white p-4 rounded-2xl shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SearchDropdown
            value={category}
            onValueChange={setCategory}
            items={categories}
            placeholder="Alle kategorier"
            className="w-full"
          />
          
          <EnhancedLocationSelector
            value={location}
            onChange={handleLocationChange}
            placeholder="Velg sted..."
            className="w-full"
            showDetectLocation={true}
          />
        </div>

        <div className="flex gap-3">
          <SearchAutocomplete
            value={searchQuery}
            onChange={setSearchQuery}
            onSuggestionSelect={(suggestion) => {
              setSearchQuery(suggestion)
              // Auto-submit search when suggestion is selected
              setTimeout(() => {
                if (suggestion.trim() || location.trim()) {
                  const params = new URLSearchParams()
                  
                  if (suggestion.trim()) {
                    params.set('query', suggestion.trim())
                  }
                  
                  if (location.trim()) {
                    params.set('location', location.trim())
                  }
                  
                  if (category && category !== 'all') {
                    params.set('category', category)
                  }

                  if (userCoordinates) {
                    params.set('lat', userCoordinates.lat.toString())
                    params.set('lng', userCoordinates.lng.toString())
                  }
                  
                  router.push(`/search?${params.toString()}`)
                }
              }, 100)
            }}
            placeholder="Hva vil du leie?"
            className="flex-1"
          />

          <Button 
            type="submit" 
            size="icon" 
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 flex-shrink-0"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Søk</span>
          </Button>

          {searchParams.size > 0 && (
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleSaveSearch}
              className="rounded-xl bg-white border-2 border-gray-200 hover:bg-gray-100 flex-shrink-0"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Lagre søk</span>
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

export function SearchBar(props: SearchBarProps) {
  return (
    <Suspense fallback={
      <div className="w-full">
        {/* Desktop Skeleton */}
        <div className="hidden lg:flex items-center gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
          <div className="w-[180px] h-10 bg-gray-100 rounded-md animate-pulse" />
          <div className="flex-1 h-10 bg-gray-100 rounded-md animate-pulse" />
          <div className="w-[200px] h-10 bg-gray-100 rounded-md animate-pulse" />
          <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
        </div>
        
        {/* Mobile Skeleton */}
        <div className="lg:hidden bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
            <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-gray-100 rounded-md animate-pulse" />
            <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    }>
      <SearchBarContent {...props} />
    </Suspense>
  )
}

