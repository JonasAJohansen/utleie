'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2, Star, TrendingUp } from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string
  icon: string
  is_popular: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

const defaultFormData = {
  name: '',
  description: '',
  icon: '',
  is_popular: false,
  is_featured: false
}

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState(defaultFormData)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData(defaultFormData)
    setSelectedCategory(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = selectedCategory 
        ? `/api/admin/categories/${encodeURIComponent(selectedCategory.name)}`
        : '/api/admin/categories'
      
      const response = await fetch(url, {
        method: selectedCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Category ${selectedCategory ? 'updated' : 'created'} successfully`,
        })
        await fetchCategories()
        setIsAddDialogOpen(false)
        setIsEditDialogOpen(false)
        resetForm()
      } else {
        throw new Error('Failed to save category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast({
        title: "Error",
        description: `Failed to ${selectedCategory ? 'update' : 'create'} category`,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        })
        await fetchCategories()
      } else {
        throw new Error('Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      is_popular: category.is_popular,
      is_featured: category.is_featured
    })
    setIsEditDialogOpen(true)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Category name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Category description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon (emoji or URL)</label>
              <Input
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                placeholder="Category icon"
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('is_popular', checked === true)
                  }
                />
                <label htmlFor="is_popular" className="text-sm font-medium">
                  Popular Category
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('is_featured', checked === true)
                  }
                />
                <label htmlFor="is_featured" className="text-sm font-medium">
                  Featured Category
                </label>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Add Category
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Category name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Category description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon (emoji or URL)</label>
              <Input
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                placeholder="Category icon"
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_is_popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('is_popular', checked === true)
                  }
                />
                <label htmlFor="edit_is_popular" className="text-sm font-medium">
                  Popular Category
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('is_featured', checked === true)
                  }
                />
                <label htmlFor="edit_is_featured" className="text-sm font-medium">
                  Featured Category
                </label>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Update Category
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.icon}</TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {category.is_popular && (
                      <div className="flex items-center text-yellow-500" title="Popular">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                    )}
                    {category.is_featured && (
                      <div className="flex items-center text-yellow-500" title="Featured">
                        <Star className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

