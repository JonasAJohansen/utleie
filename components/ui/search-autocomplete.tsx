'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Clock, TrendingUp, Hash, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Suggestion {
  text: string
  type: 'listing' | 'category' | 'brand'
  frequency: number
}

interface SearchAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSuggestionSelect?: (suggestion: string) => void
  placeholder?: string
  className?: string
  showResults?: boolean
  onResultsChange?: (hasResults: boolean) => void
}

export function SearchAutocomplete({
  value,
  onChange,
  onSuggestionSelect,
  placeholder = "Søk etter gjenstander...",
  className,
  showResults = true,
  onResultsChange
}: SearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounced search for autocomplete
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setSuggestions([])
        setShowDropdown(false)
        onResultsChange?.(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}&limit=8`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions || [])
          setShowDropdown(data.suggestions?.length > 0)
          onResultsChange?.(data.suggestions?.length > 0)
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
        setShowDropdown(false)
        onResultsChange?.(false)
      } finally {
        setIsLoading(false)
      }
    },
    [onResultsChange]
  )

  // Debounced effect for autocomplete
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (showResults) {
        fetchSuggestions(value)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [value, fetchSuggestions, showResults])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion)
    onSuggestionSelect?.(suggestion)
    setShowDropdown(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex].text)
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowDropdown(true)
    }
  }

  // Handle input blur (with delay for clicks)
  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false)
      setSelectedIndex(-1)
    }, 200)
  }

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'category':
        return <Hash className="h-4 w-4 text-blue-500" />
      case 'brand':
        return <TrendingUp className="h-4 w-4 text-purple-500" />
      default:
        return <Search className="h-4 w-4 text-gray-500" />
    }
  }

  // Get badge for suggestion type
  const getSuggestionBadge = (type: string) => {
    switch (type) {
      case 'category':
        return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Kategori</Badge>
      case 'brand':
        return <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">Merke</Badge>
      default:
        return null
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-10 border-0 bg-transparent rounded-lg focus:ring-0 focus:outline-none"
        />
        
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Autocomplete dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <Card 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto"
        >
          <CardContent className="p-0">
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.text}-${suggestion.type}-${index}`}
                  onClick={() => handleSuggestionSelect(suggestion.text)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group transition-colors",
                    selectedIndex === index && "bg-emerald-50"
                  )}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="mr-3 flex-shrink-0">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {suggestion.text}
                      </div>
                      
                      {suggestion.frequency > 1 && (
                        <div className="text-xs text-gray-500">
                          {suggestion.frequency} treff
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-2 flex-shrink-0">
                      {getSuggestionBadge(suggestion.type)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 