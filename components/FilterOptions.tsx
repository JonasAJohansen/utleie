import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"

interface FilterOptionsProps {
  categories: string[]
  onFilterChange: (filters: FilterState) => void
}

interface FilterState {
  categories: string[]
  priceRange: [number, number]
}

export function FilterOptions({ categories, onFilterChange }: FilterOptionsProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]])
  }

  const applyFilters = () => {
    onFilterChange({
      categories: selectedCategories,
      priceRange: priceRange
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Categories</h3>
        {categories.map(category => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox
              id={category}
              checked={selectedCategories.includes(category)}
              onCheckedChange={() => handleCategoryChange(category)}
            />
            <Label htmlFor={category}>{category}</Label>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Price Range</h3>
        <Slider
          min={0}
          max={100}
          step={1}
          value={priceRange}
          onValueChange={handlePriceChange}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{priceRange[0]} kr</span>
          <span>{priceRange[1]} kr</span>
        </div>
      </div>
      <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
    </div>
  )
}

