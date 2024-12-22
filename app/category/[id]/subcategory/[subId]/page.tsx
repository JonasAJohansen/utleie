import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { categories } from '@/lib/categoryData'

interface CategoryPageProps {
  params: {
    id: string
  }
}

async function getCategoryData(id: string) {
  // This would typically be an API call or database query
  const category = categories.find(c => c.id === parseInt(id))
  if (!category) {
    notFound()
  }
  return category
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryData(params.id)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{category.name}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Subcategories</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading subcategories...</div>}>
            <SubcategoryList categoryId={params.id} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function SubcategoryList({ categoryId }: { categoryId: string }) {
  const category = await getCategoryData(categoryId)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {category.subcategories.map((subcategory) => (
        <Button
          key={subcategory.id}
          variant="outline"
          className="h-24 text-lg font-semibold"
          asChild
        >
          <a href={`/category/${categoryId}/subcategory/${subcategory.id}`}>
            {subcategory.name}
          </a>
        </Button>
      ))}
    </div>
  )
}

