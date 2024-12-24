'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search, Bookmark } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"

interface SearchBarProps {
  initialQuery?: string
}

function SearchBarContent({ initialQuery = '' }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useUser()

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
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

  return (
    <form onSubmit={handleSearch} className="flex items-center max-w-3xl mx-auto">
      <div className="flex-grow">
        <div className="relative">
          <Input
            type="text"
            placeholder="What would you like to rent?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 h-14 bg-white/90 backdrop-blur-sm text-black placeholder:text-gray-500 text-lg rounded-l-full rounded-r-none border-2 border-r-0 border-white/20 focus:border-white/40 transition-colors"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>
      </div>
      <div className="flex transition-transform duration-300 ease-in-out">
        <Button 
          type="submit" 
          size="lg"
          className="h-14 px-8 rounded-none bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-lg transition-colors"
        >
          Search
        </Button>
        {searchParams.size > 0 && (
          <div className="transition-all duration-300 ease-in-out">
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={handleSaveSearch}
              className="h-14 px-4 rounded-l-none rounded-r-full border-2 border-l-0 border-white/20 transition-colors"
            >
              <Bookmark className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}

export function SearchBar(props: SearchBarProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center max-w-3xl mx-auto">
        <Input
          type="text"
          placeholder="Loading..."
          disabled
          className="w-full pl-12 h-14 bg-white/90 backdrop-blur-sm text-black placeholder:text-gray-500 text-lg rounded-l-full rounded-r-none border-2 border-r-0 border-white/20"
        />
        <Button 
          disabled
          size="lg"
          className="h-14 px-8 rounded-none bg-yellow-400 text-black font-semibold text-lg"
        >
          Search
        </Button>
      </div>
    }>
      <SearchBarContent {...props} />
    </Suspense>
  )
}

