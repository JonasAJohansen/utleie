'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

interface Brand {
  id: string
  name: string
  category_id: string
  category_name: string
}

interface Category {
  id: string
  name: string
}

export default function BrandsAdmin() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newBrand, setNewBrand] = useState({ name: '', categoryId: '' })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchBrands()
    fetchCategories()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      if (!response.ok) throw new Error('Failed to fetch brands')
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to fetch brands",
        variant: "destructive",
      })
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newBrand.name,
          categoryId: newBrand.categoryId,
        }),
      })

      if (!response.ok) throw new Error('Failed to create brand')

      toast({
        title: "Success",
        description: "Brand created successfully",
      })

      setNewBrand({ name: '', categoryId: '' })
      fetchBrands()
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to create brand",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Brand</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Brand Name</Label>
              <Input
                id="name"
                value={newBrand.name}
                onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={newBrand.categoryId} 
                onValueChange={(value) => setNewBrand({ ...newBrand, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Brand'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Brands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-medium">{brand.name}</div>
                  <div className="text-sm text-gray-500">Category: {brand.category_name}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 