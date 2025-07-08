import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
        <h3 className="text-lg font-semibold mb-2">Price Range (per day)</h3>
        <div className="flex items-center space-x-4 mb-2">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={priceRange[0].toString()}
            onChange={(e) => {
              const value = e.target.value
              if (value === '' || /^\d+$/.test(value)) {
                const numValue = value === '' ? 0 : parseInt(value)
                setPriceRange([numValue, priceRange[1]])
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
            value={priceRange[1].toString()}
            onChange={(e) => {
              const value = e.target.value
              if (value === '' || /^\d+$/.test(value)) {
                const numValue = value === '' ? 0 : parseInt(value)
                setPriceRange([priceRange[0], numValue])
              }
            }}
            className="w-24"
            placeholder="Max"
          />
          <span className="text-sm text-gray-600">kr</span>
        </div>
      </div>
      <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
    </div>
  )
}

