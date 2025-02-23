'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import { SearchDropdown } from "@/components/ui/search-dropdown"

interface SearchBarProps {
  initialQuery?: string
}

const categories = [
  { value: "all", label: "Alle kategorier" },
  { value: "electronics", label: "Elektronikk" },
  { value: "tools", label: "Verktøy" },
  { value: "sports", label: "Sport" },
  { value: "camping", label: "Camping" },
]

const locations = [
  { value: "oslo", label: "Oslo" },
  { value: "bergen", label: "Bergen" },
  { value: "trondheim", label: "Trondheim" },
  { value: "stavanger", label: "Stavanger" },
]

function SearchBarContent({ initialQuery = '' }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('all')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useUser()

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams()
      params.set('q', searchQuery.trim())
      if (location) {
        params.set('location', location)
      }
      if (category && category !== 'all') {
        params.set('category', category)
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
    <form onSubmit={handleSearch} className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-lg">
      <SearchDropdown
        value={category}
        onValueChange={setCategory}
        items={categories}
        placeholder="Alle kategorier"
        className="w-[180px]"
      />

      <Input
        type="text"
        placeholder="Hva vil du leie?"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />

      <SearchDropdown
        value={location}
        onValueChange={setLocation}
        items={locations}
        placeholder="Velg sted"
        className="w-[180px]"
      />

      <Button 
        type="submit" 
        size="icon" 
        className="rounded-full bg-[#4CD964] hover:bg-[#3DAF50]"
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
    </form>
  )
}

export function SearchBar(props: SearchBarProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
        <div className="w-[180px] h-10 bg-gray-100 rounded-md animate-pulse" />
        <div className="flex-1 h-10 bg-gray-100 rounded-md animate-pulse" />
        <div className="w-[180px] h-10 bg-gray-100 rounded-md animate-pulse" />
        <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
      </div>
    }>
      <SearchBarContent {...props} />
    </Suspense>
  )
}

