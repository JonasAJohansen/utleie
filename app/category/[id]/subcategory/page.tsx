import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { categories } from '@/lib/categoryData'
import { getSubcategories, Subcategory } from '@/lib/subcategory'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const category = categories.find(c => c.id === parseInt(id))
  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }
  return {
    title: `${category.name} Subcategories | RentEase`,
  }
}

async function getCategoryData(id: string) {
  const categoryId = parseInt(id)
  const category = categories.find(c => c.id === categoryId)
  if (!category) {
    notFound()
  }
  const subcategories = getSubcategories(categoryId)
  return { category, subcategories }
}

export default async function CategorySubcategoriesPage({ params }: Props) {
  const { id } = await params
  const { category, subcategories } = await getCategoryData(id)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{category.icon} {category.name} Subcategories</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Subcategories</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading subcategories...</div>}>
            <SubcategoryList categoryId={category.id} subcategories={subcategories} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function SubcategoryList({ categoryId, subcategories }: { categoryId: number, subcategories: Subcategory[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {subcategories.map((subcategory) => (
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
  )
}

