'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { categories } from '@/lib/categoryData'
import { getSubcategories, Subcategory } from '@/lib/subcategory'

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [category, setCategory] = useState<(typeof categories)[0] | undefined>()
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const router = useRouter()

  useEffect(() => {
    const categoryId = parseInt(params.id)
    const foundCategory = categories.find(c => c.id === categoryId)
    if (foundCategory) {
      setCategory(foundCategory)
      setSubcategories(getSubcategories(categoryId))
    } else {
      router.push('/404')
    }
  }, [params.id, router])

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
            {subcategories.map((subcategory) => (
              <Link 
                key={subcategory.id} 
                href={`/category/${category.id}/subcategory/${subcategory.id}`}
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

