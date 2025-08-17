'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryCount {
  name: string
  id: string
  count: number
}

interface CategoryFilterProps {
  categories: CategoryCount[]
  selectedCategory?: string
  onCategorySelect: (categoryId: string | null) => void
  totalResults: number
  className?: string
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  totalResults,
  className 
}: CategoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (categories.length === 0) {
    return null
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filter by Category
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* All Categories Option */}
        <Button
          variant={!selectedCategory ? "default" : "ghost"}
          className={cn(
            "w-full justify-between h-auto p-3",
            !selectedCategory && "bg-emerald-500 hover:bg-emerald-600"
          )}
          onClick={() => onCategorySelect(null)}
        >
          <div className="flex items-center gap-2">
            {!selectedCategory && <Check className="h-4 w-4" />}
            <span className="font-medium">All Categories</span>
          </div>
          <Badge variant="secondary" className="ml-2">
            {totalResults}
          </Badge>
        </Button>

        {/* Individual Categories */}
        <div className="space-y-2">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.name
            
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "ghost"}
                className={cn(
                  "w-full justify-between h-auto p-3 text-left",
                  isSelected && "bg-emerald-500 hover:bg-emerald-600"
                )}
                onClick={() => onCategorySelect(category.name)}
              >
                <div className="flex items-center gap-2">
                  {isSelected && <Check className="h-4 w-4" />}
                  <span className="font-medium">{category.name}</span>
                </div>
                <Badge 
                  variant={isSelected ? "secondary" : "outline"}
                  className="ml-2"
                >
                  {category.count}
                </Badge>
              </Button>
            )
          })}
        </div>

        {/* Show only if many categories */}
        {categories.length > 8 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-2"
          >
            {isExpanded ? 'Show Less' : `Show ${categories.length - 8} More`}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}