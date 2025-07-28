'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  BookmarkPlus, 
  Bookmark, 
  MapPin, 
  Tag, 
  DollarSign, 
  Calendar,
  X,
  Edit3,
  Trash2,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@clerk/nextjs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils'

interface SavedSearch {
  id: string
  title: string
  searchQuery: any
  createdAt: string
  filters: {
    query: string
    location: string
    category: string
    minPrice: number | null
    maxPrice: number | null
    lat: number | null
    lng: number | null
  }
}

interface SavedSearchManagerProps {
  className?: string
  variant?: 'full' | 'compact'
  currentSearchParams?: URLSearchParams
  showSaveButton?: boolean
}

export function SavedSearchManager({
  className,
  variant = 'full',
  currentSearchParams,
  showSaveButton = true
}: SavedSearchManagerProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveTitle, setSaveTitle] = useState('')
  const { toast } = useToast()
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchSavedSearches()
    }
  }, [user])

  const fetchSavedSearches = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/saved-searches')
      if (response.ok) {
        const data = await response.json()
        setSavedSearches(data)
      }
    } catch (error) {
      console.error('Error fetching saved searches:', error)
      toast({
        title: "Feil",
        description: "Kunne ikke laste lagrede søk",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveCurrentSearch = async () => {
    if (!currentSearchParams || !user) return

    const searchData: any = {
      title: saveTitle || generateTitle(),
    }

    // Extract all search parameters
    currentSearchParams.forEach((value, key) => {
      if (key === 'minPrice' || key === 'maxPrice') {
        searchData[key] = parseFloat(value) || null
      } else if (key === 'lat' || key === 'lng') {
        searchData[key] = parseFloat(value) || null
      } else {
        searchData[key] = value
      }
    })

    try {
      setIsSaving(true)
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchData),
      })

      if (response.ok) {
        const newSearch = await response.json()
        setSavedSearches(prev => [newSearch, ...prev])
        setSaveDialogOpen(false)
        setSaveTitle('')
        toast({
          title: "Søk lagret",
          description: "Du kan finne det i dine lagrede søk",
        })
      } else {
        const error = await response.text()
        throw new Error(error)
      }
    } catch (error) {
      console.error('Error saving search:', error)
      toast({
        title: "Feil",
        description: error instanceof Error ? error.message : "Kunne ikke lagre søket",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const deleteSearch = async (searchId: string) => {
    try {
      const response = await fetch('/api/saved-searches', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchId }),
      })

      if (response.ok) {
        setSavedSearches(prev => prev.filter(s => s.id !== searchId))
        toast({
          title: "Søk slettet",
          description: "Det lagrede søket er fjernet",
        })
      } else {
        throw new Error('Failed to delete search')
      }
    } catch (error) {
      console.error('Error deleting search:', error)
      toast({
        title: "Feil",
        description: "Kunne ikke slette søket",
        variant: "destructive",
      })
    }
  }

  const applySearch = (search: SavedSearch) => {
    const params = new URLSearchParams()
    
    Object.entries(search.filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, value.toString())
      }
    })

    router.push(`/search?${params.toString()}`)
  }

  const generateTitle = () => {
    if (!currentSearchParams) return 'Nytt søk'
    
    const query = currentSearchParams.get('query')
    const location = currentSearchParams.get('location')
    const category = currentSearchParams.get('category')
    
    if (query && location) return `${query} i ${location}`
    if (query) return `Søk: ${query}`
    if (location) return `Sted: ${location}`
    if (category) return `Kategori: ${category}`
    
    return 'Nytt søk'
  }

  const formatSearchSummary = (filters: SavedSearch['filters']) => {
    const parts = []
    
    if (filters.query) parts.push(filters.query)
    if (filters.location) parts.push(`📍 ${filters.location}`)
    if (filters.category) parts.push(`🏷️ ${filters.category}`)
    if (filters.minPrice || filters.maxPrice) {
      const priceRange = [
        filters.minPrice ? `${filters.minPrice} kr` : '',
        filters.maxPrice ? `${filters.maxPrice} kr` : ''
      ].filter(Boolean).join(' - ')
      if (priceRange) parts.push(`💰 ${priceRange}`)
    }
    
    return parts.join(' • ') || 'Alle annonser'
  }

  if (!user) {
    return null
  }

  // Compact variant for sidebars
  if (variant === 'compact') {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Lagrede søk</h3>
          {showSaveButton && currentSearchParams && (
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  <BookmarkPlus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Lagre søk</DialogTitle>
                  <DialogDescription>
                    Gi søket ditt et navn for å finne det igjen senere
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Navn på søket..."
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                  />
                  <div className="text-sm text-gray-600">
                    Søkekriterier: {generateTitle()}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={saveCurrentSearch}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Lagrer...
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="h-4 w-4 mr-2" />
                        Lagre søk
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : savedSearches.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Bookmark className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">Ingen lagrede søk</p>
          </div>
        ) : (
          <div className="space-y-1">
            {savedSearches.slice(0, 5).map((search) => (
              <div key={search.id} className="group">
                <button
                  onClick={() => applySearch(search)}
                  className="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {search.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {formatSearchSummary(search.filters)}
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSearch(search.id)}
                  className="opacity-0 group-hover:opacity-100 absolute right-1 top-1 h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            {savedSearches.length > 5 && (
              <button
                onClick={() => router.push('/saved-searches')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Se alle ({savedSearches.length})
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // Full variant for main content areas
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bookmark className="h-5 w-5 mr-2" />
            Lagrede søk
          </CardTitle>
          {showSaveButton && currentSearchParams && (
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Lagre dette søket
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Lagre søk</DialogTitle>
                  <DialogDescription>
                    Gi søket ditt et navn for å finne det igjen senere
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Navn på søket..."
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                  />
                  <div className="text-sm text-gray-600">
                    <strong>Søkekriterier:</strong> {generateTitle()}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={saveCurrentSearch}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Lagrer...
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="h-4 w-4 mr-2" />
                        Lagre søk
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              </div>
            ))}
          </div>
        ) : savedSearches.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bookmark className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Ingen lagrede søk</h3>
            <p className="text-sm">
              Lagre søk for å finne dem raskt igjen senere
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedSearches.map((search) => (
              <Card key={search.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {search.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatSearchSummary(search.filters)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applySearch(search)}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Søk
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSearch(search.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {search.filters.query && (
                      <Badge variant="secondary">
                        <Search className="h-3 w-3 mr-1" />
                        {search.filters.query}
                      </Badge>
                    )}
                    {search.filters.location && (
                      <Badge variant="secondary">
                        <MapPin className="h-3 w-3 mr-1" />
                        {search.filters.location}
                      </Badge>
                    )}
                    {search.filters.category && (
                      <Badge variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {search.filters.category}
                      </Badge>
                    )}
                    {(search.filters.minPrice || search.filters.maxPrice) && (
                      <Badge variant="secondary">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {search.filters.minPrice || 0} - {search.filters.maxPrice || '∞'} kr
                      </Badge>
                    )}
                    
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(search.createdAt).toLocaleDateString('no-NO')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 