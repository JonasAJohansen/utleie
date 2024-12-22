'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ItemGrid } from '@/components/ItemGrid'
import { categories } from '@/lib/categoryData'
import { getSubcategoryById, Subcategory } from '@/lib/subcategory'
import { useRouter } from 'next/navigation'

// This would typically come from a database or API
const allItems = [
  { id: 1, name: 'Mountain Bike', price: 25, image: '/placeholder.svg?height=200&width=300', rating: 4.5, location: 'Denver, CO', priceType: 'day', category: 'Sports & Outdoors', subcategory: 'Cycling', features: ['Free Delivery', 'Damage Protection'] },
  { id: 2, name: 'Camping Tent', price: 30, image: '/placeholder.svg?height=200&width=300', rating: 4.2, location: 'Portland, OR', priceType: 'day', category: 'Sports & Outdoors', subcategory: 'Camping & Hiking', features: ['Pet Friendly', 'Long Term Rental'] },
  { id: 3, name: 'Surfboard', price: 35, image: '/placeholder.svg?height=200&width=300', rating: 4.7, location: 'Los Angeles, CA', priceType: 'day', category: 'Sports & Outdoors', subcategory: 'Water Sports', features: ['Free Delivery', 'Damage Protection'] },
  { id: 4, name: 'DSLR Camera', price: 40, image: '/placeholder.svg?height=200&width=300', rating: 4.8, location: 'New York, NY', priceType: 'day', category: 'Electronics', subcategory: 'Cameras', features: ['Instant Book', 'Flexible Cancellation'] },
  { id: 5, name: 'Lawn Mower', price: 30, image: '/placeholder.svg?height=200&width=300', rating: 4.4, location: 'Chicago, IL', priceType: 'day', category: 'Home & Garden', subcategory: 'Garden Equipment', features: ['Pet Friendly', 'Long Term Rental'] },
]

type Props = {
  params: Promise<{ id: string; subId: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function SubcategoryPage({ params }: Props) {
  const [category, setCategory] = useState<(typeof categories)[0] | undefined>()
  const [subcategory, setSubcategory] = useState<Subcategory | undefined>()
  const [items, setItems] = useState<typeof allItems>([])
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const { id, subId } = await params
      const categoryId = parseInt(id)
      const subcategoryId = parseInt(subId)
      const foundCategory = categories.find(c => c.id === categoryId)
      const foundSubcategory = getSubcategoryById(categoryId, subcategoryId)

      if (foundCategory && foundSubcategory) {
        setCategory(foundCategory)
        setSubcategory(foundSubcategory)
        setItems(allItems.filter(item => 
          item.category === foundCategory.name && 
          item.subcategory === foundSubcategory.name
        ))
      } else {
        router.push('/404')
      }
    }

    loadData()
  }, [params, router])

  if (!category || !subcategory) {
    return null
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{category.name} - {subcategory.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Items in {subcategory.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{items.length} items found</p>
          <ItemGrid items={items} />
        </CardContent>
      </Card>
    </div>
  )
}

