'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Camera, Car, Drill, Gamepad, Guitar, Laptop, Mountain, Shirt, Tent, Tv, Grid, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

interface Category {
  id: string
  name: string
  description: string
  icon?: string
  itemCount?: number
  href: string
}

// Icon mapping for categories
const iconMap: Record<string, any> = {
  electronics: Laptop,
  tools: Drill,
  vehicles: Car,
  cameras: Camera,
  gaming: Gamepad,
  music: Guitar,
  camping: Tent,
  sports: Mountain,
  clothing: Shirt,
  entertainment: Tv,
}

// Color mapping for categories
const colorMap: Record<string, { color: string; bgColor: string }> = {
  electronics: { color: "text-blue-500", bgColor: "bg-blue-50" },
  tools: { color: "text-orange-500", bgColor: "bg-orange-50" },
  vehicles: { color: "text-purple-500", bgColor: "bg-purple-50" },
  cameras: { color: "text-pink-500", bgColor: "bg-pink-50" },
  gaming: { color: "text-green-500", bgColor: "bg-green-50" },
  music: { color: "text-yellow-500", bgColor: "bg-yellow-50" },
  camping: { color: "text-indigo-500", bgColor: "bg-indigo-50" },
  sports: { color: "text-red-500", bgColor: "bg-red-50" },
  clothing: { color: "text-teal-500", bgColor: "bg-teal-50" },
  entertainment: { color: "text-cyan-500", bgColor: "bg-cyan-50" },
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setFilteredCategories(
        categories.filter(category =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredCategories(categories)
    }
  }, [searchTerm, categories])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        
        // Transform the data to include proper hrefs and item counts
        const transformedCategories = data.map((category: any) => ({
          ...category,
          href: `/category/${category.id}`,
          itemCount: Math.floor(Math.random() * 3000) + 100, // Mock item count for now
        }))
        
        setCategories(transformedCategories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (categoryName: string) => {
    const key = categoryName.toLowerCase()
    return iconMap[key] || Grid
  }

  const getCategoryColors = (categoryName: string) => {
    const key = categoryName.toLowerCase()
    return colorMap[key] || { color: "text-gray-500", bgColor: "bg-gray-50" }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Alle kategorier</h1>
        <p className="text-gray-600 mb-6">
          Utforsk alle våre kategorier for å finne akkurat det du leter etter
        </p>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Søk i kategorier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array(15).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <Skeleton className="w-12 h-12 rounded-lg mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredCategories.map((category) => {
              const IconComponent = getCategoryIcon(category.name)
              const colors = getCategoryColors(category.name)
              
              return (
                <Link key={category.id} href={category.href}>
                  <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <CardContent className="p-6">
                      <div
                        className={`w-12 h-12 rounded-lg ${colors.bgColor} ${colors.color} flex items-center justify-center mb-4`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-500">
                        {category.itemCount ? `${category.itemCount} gjenstander` : 'Se annonser'}
                      </p>
                      {category.description && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {!isLoading && filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Grid className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ingen kategorier funnet</h3>
              <p className="text-gray-600">
                {searchTerm
                  ? `Ingen kategorier matcher "${searchTerm}". Prøv et annet søkeord.`
                  : 'Det ser ut til at ingen kategorier er tilgjengelige for øyeblikket.'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
} 