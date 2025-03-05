'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Laptop, 
  Drill, 
  Camera, 
  Tv, 
  Shirt, 
  Music, 
  Gamepad2 as Gamepad, 
  Car, 
  Tent, 
  Wrench, 
  ChevronLeft, 
  ChevronRight,
  Mountain
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Define the categories with their icons
const CATEGORIES = [
  { id: 'all', name: 'All', icon: Wrench }, 
  { id: 'electronics', name: 'Electronics', icon: Laptop },
  { id: 'tools', name: 'Tools', icon: Drill },
  { id: 'sports', name: 'Sports', icon: Mountain },
  { id: 'cameras', name: 'Cameras', icon: Camera },
  { id: 'entertainment', name: 'Entertainment', icon: Tv },
  { id: 'clothing', name: 'Clothing', icon: Shirt },
  { id: 'music', name: 'Music', icon: Music },
  { id: 'gaming', name: 'Gaming', icon: Gamepad },
  { id: 'vehicles', name: 'Vehicles', icon: Car },
  { id: 'camping', name: 'Camping', icon: Tent },
]

interface CategoryScrollbarProps {
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
}

export function CategoryScrollbar({ selectedCategory, onCategorySelect }: CategoryScrollbarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  
  // Check if scrolling is possible and update arrow visibility
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer
    }
  }
  
  // Add scroll event listener
  useEffect(() => {
    const scrollEl = scrollRef.current
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll)
      // Initial check
      checkScroll()
      return () => scrollEl.removeEventListener('scroll', checkScroll)
    }
  }, [])
  
  // Scroll functions
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }
  
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }
  
  // Handle category selection
  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'all') {
      onCategorySelect(null)
    } else if (categoryId === selectedCategory) {
      onCategorySelect(null) // Toggle off if already selected
    } else {
      onCategorySelect(categoryId)
    }
  }
  
  return (
    <div className="relative w-full">
      {/* Left scroll arrow */}
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-md rounded-full"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      
      {/* Categories scroll area */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide space-x-4 px-2 py-3"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {CATEGORIES.map((category) => {
          const isSelected = 
            (category.id === 'all' && !selectedCategory) || 
            category.id === selectedCategory
          
          const IconComponent = category.icon
            
          return (
            <motion.div
              key={category.id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center px-3 py-2 h-auto gap-1 rounded-lg",
                  isSelected ? "bg-[#4CD964]/10 text-[#4CD964] border-[#4CD964] border" : "hover:bg-gray-100"
                )}
                onClick={() => handleCategoryClick(category.id)}
              >
                {IconComponent && (
                  <IconComponent className={cn(
                    "h-6 w-6 mb-1",
                    isSelected ? "text-[#4CD964]" : "text-gray-500"
                  )} />
                )}
                <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
              </Button>
            </motion.div>
          )
        })}
      </div>
      
      {/* Right scroll arrow */}
      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-md rounded-full"
          onClick={scrollRight}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
      
      <style jsx>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
} 