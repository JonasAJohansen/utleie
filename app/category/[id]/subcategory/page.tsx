'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { categories } from '@/lib/categoryData'

// This would typically come from a database
//const categories = [
//  { 
//    id: 1, 
//    name: 'Sports & Outdoors', 
//    icon: '🚵‍♂️',
//    subcategories: [
//      { id: 101, name: 'Camping & Hiking' },
//      { id: 102, name: 'Cycling' },
//      { id: 103, name: 'Water Sports' },
//    ]
//  },
//  { 
//    id: 2, 
//    name: 'Electronics', 
//    icon: '📷',
//    subcategories: [
//      { id: 201, name: 'Cameras' },
//      { id: 202, name: 'Computers' },
//      { id: 203, name: 'Audio Equipment' },
//    ]
//  },
//  { 
//    id: 3, 
//    name: 'Home & Garden', 
//    icon: '🏡',
//    subcategories: [
//      { id: 301, name: 'Tools' },
//      { id: 302, name: 'Furniture' },
//      { id: 303, name: 'Garden Equipment' },
//    ]
//  },
//]

export default function CategoryPage({ params }: { params: { id: string } }) {
  const categoryId = parseInt(params.id)
  const category = categories.find(c => c.id === categoryId)
  const router = useRouter()

  useEffect(() => {
    if (!category) {
      router.push('/404')
    }
  }, [category, router])

  if (!category) {
    return null
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{category.icon} {category.name}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Subcategories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {category.subcategories.map((subcategory) => (
              <Link 
                key={subcategory.id} 
                href={`/category/${categoryId}/subcategory/${subcategory.id}`}
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full h-24 text-lg font-semibold"
                >
                  {subcategory.name}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

