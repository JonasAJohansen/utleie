import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ItemGrid } from '@/components/ItemGrid'
import { categories } from '@/lib/categoryData'

// This would typically come from a database or API
const allItems = [
  { id: 1, name: 'Mountain Bike', price: 25, image: '/placeholder.svg?height=200&width=300', rating: 4.5, location: 'Denver, CO', priceType: 'day', category: 'Sports & Outdoors', subcategory: 'Cycling', features: ['Free Delivery', 'Damage Protection'] },
  { id: 2, name: 'Camping Tent', price: 30, image: '/placeholder.svg?height=200&width=300', rating: 4.2, location: 'Portland, OR', priceType: 'day', category: 'Sports & Outdoors', subcategory: 'Camping & Hiking', features: ['Pet Friendly', 'Long Term Rental'] },
  { id: 3, name: 'Surfboard', price: 35, image: '/placeholder.svg?height=200&width=300', rating: 4.7, location: 'Los Angeles, CA', priceType: 'day', category: 'Sports & Outdoors', subcategory: 'Water Sports', features: ['Free Delivery', 'Damage Protection'] },
  { id: 4, name: 'DSLR Camera', price: 40, image: '/placeholder.svg?height=200&width=300', rating: 4.8, location: 'New York, NY', priceType: 'day', category: 'Electronics', subcategory: 'Cameras', features: ['Instant Book', 'Flexible Cancellation'] },
  { id: 5, name: 'Lawn Mower', price: 30, image: '/placeholder.svg?height=200&width=300', rating: 4.4, location: 'Chicago, IL', priceType: 'day', category: 'Home & Garden', subcategory: 'Garden Equipment', features: ['Pet Friendly', 'Long Term Rental'] },
]

// These functions would typically fetch data from your backend
const getCategoryName = (id: string) => {
  const category = categories.find(c => c.id === parseInt(id))
  return category ? category.name : ''
}

const getSubcategoryName = (categoryId: string, subcategoryId: string) => {
  const category = categories.find(c => c.id === parseInt(categoryId))
  const subcategory = category?.subcategories.find(sc => sc.id === parseInt(subcategoryId))
  return subcategory ? subcategory.name : ''
}

// Update the Props type to match Next.js page conventions
type Props = {
  params: { id: string; subId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Add async to the component definition
export default async function SubcategoryPage({ params }: Props) {
  const categoryName = getCategoryName(params.id)
  const subcategoryName = getSubcategoryName(params.id, params.subId)

  const items = allItems.filter(item => 
    item.category === categoryName && 
    item.subcategory === subcategoryName
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{categoryName} - {subcategoryName}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Items in {subcategoryName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{items.length} items found</p>
          <ItemGrid items={items} />
        </CardContent>
      </Card>
    </div>
  )
}

