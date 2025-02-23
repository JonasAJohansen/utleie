import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface SearchDropdownProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  items: Array<{ value: string, label: string }>
  className?: string
  contentClassName?: string
}

export function SearchDropdown({
  value,
  onValueChange,
  placeholder,
  items,
  className,
  contentClassName
}: SearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedItem = items.find(item => item.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setHighlightedIndex(prev => 
            prev < items.length - 1 ? prev + 1 : prev
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
          if (highlightedIndex >= 0) {
            onValueChange(items[highlightedIndex].value)
            setIsOpen(false)
          }
          break
        case 'Escape':
          setIsOpen(false)
          break
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, items, onValueChange, highlightedIndex])

  return (
    <div 
      className={cn('relative inline-block', className)} 
      ref={dropdownRef}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls="search-dropdown-list"
    >
      <button
        type="button"
        className={cn(
          'flex items-center justify-between w-full px-4 py-2 text-sm',
          'bg-transparent hover:bg-accent/5',
          'focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
          'border-none',
          isOpen && 'bg-accent/5'
        )}
        onClick={() => setIsOpen(!isOpen)}
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
              'absolute z-50 w-full mt-1 py-1 bg-white rounded-lg shadow-lg border',
              contentClassName
            )}
            role="listbox"
            id="search-dropdown-list"
          >
            {items.map((item, index) => (
              <div
                key={item.value}
                role="option"
                aria-selected={value === item.value}
                className={cn(
                  'px-4 py-2 text-sm cursor-pointer',
                  'hover:bg-accent/5',
                  'focus:bg-accent/5 focus:outline-none',
                  value === item.value && 'bg-accent/5 font-medium',
                  highlightedIndex === index && 'bg-accent/5'
                )}
                onClick={() => {
                  onValueChange(item.value)
                  setIsOpen(false)
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {item.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 