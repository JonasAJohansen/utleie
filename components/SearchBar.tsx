'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search, Bookmark } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import { LocationSelector } from "./ui/location-selector"

interface SearchBarProps {
  initialQuery?: string
}

function SearchBarContent({ initialQuery = '' }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [location, setLocation] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useUser()

  useEffect(() => {
    const query = searchParams.get('q')
    const loc = searchParams.get('location')
    if (query) {
      setSearchQuery(query)
    }
    if (loc) {
      setLocation(loc)
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams()
      params.set('q', searchQuery.trim())
      if (location) {
        params.set('location', location)
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
      // Get all current search parameters
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
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4 max-w-3xl mx-auto">
      <div className="flex-grow flex items-center w-full">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Hva ønsker du å leie?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 h-14 bg-white/90 backdrop-blur-sm text-black placeholder:text-gray-500 text-lg rounded-l-full rounded-r-none border-2 border-r-0 border-white/20 focus:border-white/40 transition-colors"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>
        <div className="w-48">
          <LocationSelector 
            value={location} 
            onChange={setLocation}
          />
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button 
          type="submit" 
          size="lg"
          className="h-14 px-8 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-lg transition-colors shadow-md hover:shadow-lg"
        >
          <Search className="h-5 w-5 mr-2" />
          Søk
        </Button>
        {searchParams.size > 0 && (
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={handleSaveSearch}
            className="h-14 px-4 rounded-full border-2 border-white/20 transition-colors hover:bg-white/5"
          >
            <Bookmark className="h-5 w-5" />
          </Button>
        )}
      </div>
    </form>
  )
}

export function SearchBar(props: SearchBarProps) {
  return (
    <Suspense fallback={
      <div className="flex flex-col sm:flex-row items-center gap-4 max-w-3xl mx-auto">
        <div className="flex-grow flex items-center w-full">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Loading..."
              disabled
              className="w-full pl-12 h-14 bg-white/90 backdrop-blur-sm text-black placeholder:text-gray-500 text-lg rounded-l-full rounded-r-none border-2 border-r-0 border-white/20"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          </div>
          <div className="w-48">
            <Input
              disabled
              className="h-14 rounded-r-full border-l-0"
              placeholder="Location..."
            />
          </div>
        </div>
        <div className="shrink-0">
          <Button 
            disabled
            size="lg"
            className="h-14 px-8 rounded-full bg-yellow-400 text-black font-semibold text-lg shadow-md"
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>
      </div>
    }>
      <SearchBarContent {...props} />
    </Suspense>
  )
}

