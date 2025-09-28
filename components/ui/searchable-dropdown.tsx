import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Star } from 'lucide-react'
import { Input } from './input'
import { debounce } from 'lodash'

interface SearchableDropdownItem {
  value: string
  label: string
  isPopular?: boolean
}

interface SearchableDropdownProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  items?: SearchableDropdownItem[] // Optional for static items
  className?: string
  contentClassName?: string
  disabled?: boolean
  searchPlaceholder?: string
  apiEndpoint?: string // For dynamic searching
  staticItems?: boolean // If true, only use provided items
}

export function SearchableDropdown({
  value,
  onValueChange,
  placeholder,
  items = [],
  className,
  contentClassName,
  disabled = false,
  searchPlaceholder = "Søk...",
  apiEndpoint,
  staticItems = false
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [dynamicItems, setDynamicItems] = useState<SearchableDropdownItem[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Use static items if provided, otherwise use dynamic items
  const allItems = staticItems ? items : dynamicItems
  const selectedItem = allItems.find(item => item.value === value)

  // Filter items based on search query (only for static items)
  const filteredItems = staticItems 
    ? allItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : allItems

  // Debounced API search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedApiSearch = useCallback(
    debounce(async (query: string) => {
      if (!apiEndpoint || staticItems) return

      try {
        setLoading(true)
        const url = new URL(apiEndpoint, window.location.origin)
        if (query) {
          url.searchParams.set('q', query)
        }
        url.searchParams.set('limit', '200')
        
        const response = await fetch(url.toString())
        if (response.ok) {
          const data = await response.json()
          const formattedItems = data.cities?.map((city: any) => ({
            value: city.name.toLowerCase(),
            label: city.displayName || city.name,
            isPopular: city.isPopular
          })) || []
          setDynamicItems(formattedItems)
        }
      } catch (error) {
        console.error('Error searching cities:', error)
      } finally {
        setLoading(false)
      }
    }, 300),
    [apiEndpoint, staticItems]
  )

  // Load initial items when component mounts (for dynamic mode)
  useEffect(() => {
    if (!staticItems && apiEndpoint && !initialLoaded) {
      debouncedApiSearch('')
      setInitialLoaded(true)
    }
  }, [apiEndpoint, staticItems, initialLoaded, debouncedApiSearch])

  // Trigger API search when search query changes (for dynamic mode)
  useEffect(() => {
    if (!staticItems && apiEndpoint && isOpen) {
      debouncedApiSearch(searchQuery)
    }
  }, [searchQuery, apiEndpoint, staticItems, isOpen, debouncedApiSearch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setHighlightedIndex(prev => 
            prev < filteredItems.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : prev
          )
          break
        case 'Enter':
          event.preventDefault()
          if (highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
            onValueChange(filteredItems[highlightedIndex].value)
            setIsOpen(false)
            setSearchQuery('')
          }
          break
        case 'Escape':
          setIsOpen(false)
          setSearchQuery('')
          break
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, filteredItems, onValueChange, highlightedIndex])

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [searchQuery])

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div 
      className={cn('relative inline-block', className)} 
      ref={dropdownRef}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls="searchable-dropdown-list"
    >
      <button
        type="button"
        className={cn(
          'flex items-center justify-between w-full px-4 py-2 text-sm',
          'bg-transparent hover:bg-accent/5',
          'focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
          'border-none',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'bg-accent/5'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={cn(
          'truncate font-medium',
          !selectedItem && 'text-muted-foreground'
        )}>
          {selectedItem?.label || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-[99999] w-full mt-1 bg-white rounded-lg shadow-lg border',
              'max-h-60 overflow-hidden',
              contentClassName
            )}
            role="listbox"
            id="searchable-dropdown-list"
          >
            {/* Search input */}
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-sm border-gray-200 focus:border-gray-300"
                />
              </div>
            </div>
            
            {/* Items list */}
            <div className="max-h-48 overflow-y-auto py-1">
              {loading ? (
                <div className="px-4 py-2 text-sm text-gray-500 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                  Søker...
                </div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <div
                    key={item.value}
                    role="option"
                    aria-selected={value === item.value}
                    className={cn(
                      'px-4 py-2 text-sm cursor-pointer flex items-center',
                      'hover:bg-accent/5',
                      'focus:bg-accent/5 focus:outline-none',
                      value === item.value && 'bg-accent/5 font-medium',
                      highlightedIndex === index && 'bg-accent/10'
                    )}
                    onClick={() => {
                      onValueChange(item.value)
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {item.isPopular && (
                      <Star className="h-3 w-3 text-yellow-500 fill-current mr-2 flex-shrink-0" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  {!staticItems && searchQuery ? 'Ingen resultater funnet' : 'Ingen alternativer tilgjengelig'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 