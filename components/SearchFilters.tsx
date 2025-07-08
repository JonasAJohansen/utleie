'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Bookmark } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import { SearchableDropdown } from "@/components/ui/searchable-dropdown"

interface SearchFiltersProps {
  onFilterChange: (filters: SearchFilters) => void
}

export interface SearchFilters {
  priceRange: [number, number]
  category: string
  subcategory: string
  sortBy: string
  features: string[]
  dateRange: { from: Date | undefined; to: Date | undefined }
  location: string
  rating: number
}

const mainCategories = [
  { value: 'all', label: 'Alle kategorier' },
  { value: 'electronics-tech', label: 'Elektronikk & Teknologi' },
  { value: 'home-diy', label: 'Hjem & Gjør-det-selv' },
  { value: 'sport-outdoor', label: 'Sport & Friluft' },
  { value: 'music-hobby', label: 'Musikk & Hobby' },
  { value: 'transport', label: 'Transport' },
]

const subcategories: Record<string, { value: string; label: string }[]> = {
  'electronics-tech': [
    { value: 'all', label: 'Alle' },
    { value: 'elektronikk', label: 'Elektronikk' },
    { value: 'kameraer', label: 'Kameraer' },
    { value: 'underholdning', label: 'Underholdning' },
  ],
  'home-diy': [
    { value: 'all', label: 'Alle' },
    { value: 'verktoy', label: 'Verktøy' },
    { value: 'hageartikler', label: 'Hageartikler' },
    { value: 'interior', label: 'Interiør' },
  ],
  'sport-outdoor': [
    { value: 'all', label: 'Alle' },
    { value: 'sport', label: 'Sport' },
    { value: 'camping', label: 'Camping' },
    { value: 'vannsport', label: 'Vannsport' },
  ],
  'music-hobby': [
    { value: 'all', label: 'Alle' },
    { value: 'musikk', label: 'Musikk' },
    { value: 'spill', label: 'Spill' },
    { value: 'hobby-fritid', label: 'Hobby & Fritid' },
  ],
  'transport': [
    { value: 'all', label: 'Alle' },
    { value: 'kjoretoy', label: 'Kjøretøy' },
    { value: 'sykler', label: 'Sykler' },
  ],
}

const features = [
  'Gratis levering',
  'Øyeblikkelig booking',
  'Kjæledyrvennlig',
  'Langtidsleie',
  'Skadeforsikring',
  'Fleksibel avbestilling',
]

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useUser()
  
  // Initialize state from URL parameters
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [
      Number(searchParams.get('minPrice')) || 0,
      Number(searchParams.get('maxPrice')) || 100
    ],
    category: searchParams.get('category') || 'all',
    subcategory: searchParams.get('subcategory') || 'all',
    sortBy: searchParams.get('sortBy') || 'relevance',
    features: searchParams.get('features')?.split(',') || [],
    dateRange: {
      from: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      to: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined
    },
    location: searchParams.get('location') || '',
    rating: Number(searchParams.get('rating')) || 0
  })

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
    
    // Update URL with new filters
    const params = new URLSearchParams(searchParams)
    
    if (updatedFilters.priceRange) {
      params.set('minPrice', updatedFilters.priceRange[0].toString())
      params.set('maxPrice', updatedFilters.priceRange[1].toString())
    }
    if (updatedFilters.category !== 'all') {
      params.set('category', updatedFilters.category)
    } else {
      params.delete('category')
    }
    if (updatedFilters.subcategory !== 'all') {
      params.set('subcategory', updatedFilters.subcategory)
    } else {
      params.delete('subcategory')
    }
    if (updatedFilters.sortBy !== 'relevance') {
      params.set('sortBy', updatedFilters.sortBy)
    } else {
      params.delete('sortBy')
    }
    if (updatedFilters.features.length > 0) {
      params.set('features', updatedFilters.features.join(','))
    } else {
      params.delete('features')
    }
    if (updatedFilters.location) {
      params.set('location', updatedFilters.location)
    } else {
      params.delete('location')
    }
    if (updatedFilters.rating > 0) {
      params.set('rating', updatedFilters.rating.toString())
    } else {
      params.delete('rating')
    }

    router.push(`/search?${params.toString()}`)
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
        description: "Kunne ikke lagre søk. Vennligst prøv igjen.",
        variant: "destructive",
      })
    }
  }

  const handleRatingChange = (value: number[]) => {
    // Ensure we always have two values for the price range
    updateFilters({ rating: value[0] })
  }



  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filtre</CardTitle>
        {searchParams.size > 0 && (
          <div className="transition-all duration-300 ease-in-out">
            <Button variant="outline" size="sm" onClick={handleSaveSearch}>
              <Bookmark className="h-4 w-4 mr-2" />
              Lagre søk
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="price-range">Price Range (per day)</Label>
          <div className="flex items-center space-x-4 mt-2">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={filters.priceRange[0].toString()}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || /^\d+$/.test(value)) {
                  const numValue = value === '' ? 0 : parseInt(value)
                  updateFilters({ priceRange: [numValue, filters.priceRange[1]] })
                }
              }}
              className="w-24"
              placeholder="Min"
            />
            <span className="text-sm text-gray-600">to</span>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={filters.priceRange[1].toString()}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || /^\d+$/.test(value)) {
                  const numValue = value === '' ? 0 : parseInt(value)
                  updateFilters({ priceRange: [filters.priceRange[0], numValue] })
                }
              }}
              className="w-24"
              placeholder="Max"
            />
            <span className="text-sm text-gray-600">kr</span>
          </div>
        </div>

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="category">Kategori</Label>
          <Select onValueChange={(value) => {
            updateFilters({ category: value, subcategory: 'all' })
          }} value={filters.category}>
            <SelectTrigger id="category" className="mt-2">
              <SelectValue placeholder="Velg en kategori" />
            </SelectTrigger>
            <SelectContent>
              {mainCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filters.category !== 'all' && subcategories[filters.category] && (
          <div className="space-y-2 transition-all duration-300 ease-in-out">
            <Label htmlFor="subcategory">Underkategori</Label>
            <Select onValueChange={(value) => updateFilters({ subcategory: value })} value={filters.subcategory}>
              <SelectTrigger id="subcategory" className="mt-2">
                <SelectValue placeholder="Velg underkategori" />
              </SelectTrigger>
              <SelectContent>
                {subcategories[filters.category].map((subcat) => (
                  <SelectItem key={subcat.value} value={subcat.value}>{subcat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="sort-by">Sorter etter</Label>
          <Select onValueChange={(value) => updateFilters({ sortBy: value })} value={filters.sortBy}>
            <SelectTrigger id="sort-by" className="mt-2">
              <SelectValue placeholder="Sorter etter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevans</SelectItem>
              <SelectItem value="price_asc">Pris: Lav til høy</SelectItem>
              <SelectItem value="price_desc">Pris: Høy til lav</SelectItem>
              <SelectItem value="rating">Høyest vurdert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="features">Funksjoner</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${feature}`}
                  checked={filters.features.includes(feature)}
                  onCheckedChange={() => updateFilters({ features: filters.features.includes(feature) ? filters.features.filter(f => f !== feature) : [...filters.features, feature] })}
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

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="start-date">Startdato</Label>
          <Input
            id="start-date"
            type="date"
            value={filters.dateRange.from ? filters.dateRange.from.toISOString().split('T')[0] : ''}
            onChange={(e) => updateFilters({ dateRange: { ...filters.dateRange, from: new Date(e.target.value) } })}
          />
        </div>

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="end-date">Sluttdato</Label>
          <Input
            id="end-date"
            type="date"
            value={filters.dateRange.to ? filters.dateRange.to.toISOString().split('T')[0] : ''}
            onChange={(e) => updateFilters({ dateRange: { ...filters.dateRange, to: new Date(e.target.value) } })}
          />
        </div>

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="location">Sted</Label>
          <SearchableDropdown
            value={filters.location}
            onValueChange={(value) => updateFilters({ location: value })}
            placeholder="Velg by"
            searchPlaceholder="Søk etter norske byer..."
            apiEndpoint="/api/cities"
            className="mt-2"
          />
        </div>

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <Label htmlFor="rating">Minimum vurdering</Label>
          <Slider
            id="rating"
            min={0}
            max={5}
            step={0.5}
            value={[filters.rating]}
            onValueChange={handleRatingChange}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>{filters.rating} stjerner</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

