'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, TrendingUp } from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string
  icon: string
  is_popular: boolean
  is_featured: boolean
}

interface CategorySectionProps {
  title: string
  icon: React.ElementType
  categories: Category[]
}

const CategorySection: React.FC<CategorySectionProps> = ({ 
  title, 
  icon: Icon, 
  categories 
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-yellow-500" />
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.id}`}
          className="block p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-2">{category.icon}</div>
          <h3 className="font-medium">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
          )}
        </Link>
      ))}
    </div>
  </div>
)

export const CategoryHighlights: React.FC = () => {
  const [popularCategories, setPopularCategories] = useState<Category[]>([])
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [popularResponse, featuredResponse] = await Promise.all([
          fetch('/api/categories?type=popular'),
          fetch('/api/categories?type=featured')
        ])

        if (popularResponse.ok && featuredResponse.ok) {
          const [popularData, featuredData] = await Promise.all([
            popularResponse.json(),
            featuredResponse.json()
          ])

          setPopularCategories(popularData)
          setFeaturedCategories(featuredData)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  if (popularCategories.length === 0 && featuredCategories.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      {popularCategories.length > 0 && (
        <CategorySection
          title="Popular Categories"
          icon={TrendingUp}
          categories={popularCategories}
        />
      )}
      {featuredCategories.length > 0 && (
        <CategorySection
          title="Featured Categories"
          icon={Star}
          categories={featuredCategories}
        />
      )}
    </div>
  )
} 