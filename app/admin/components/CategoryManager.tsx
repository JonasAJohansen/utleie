'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { locations } from '@/components/ui/location-selector'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Category {
  id: string
  name: string
  is_active: boolean
  is_popular?: boolean
  is_featured?: boolean
  icon?: string
  description?: string
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', icon: '', description: '' })
  const { toast } = useToast()

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories')
        if (response.ok) {
          const data = await response.json()
          // Add default values for is_popular and is_featured since they don't exist in DB yet
          const categoriesWithDefaults = data.map((category: any) => ({
            ...category,
            is_popular: category.is_popular || false,
            is_featured: category.is_featured || false
          }))
          setCategories(categoriesWithDefaults)
        } else {
          throw new Error('Failed to fetch categories')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: 'Feil',
          description: 'Kunne ikke laste kategorier.',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleTogglePopular = async (category: Category) => {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: category.name,
          description: category.description,
          icon: category.icon,
          is_popular: !category.is_popular,
          is_featured: category.is_featured
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update category')
      }

      const updatedCategory = await response.json()
      setCategories(categories.map(c => c.id === category.id ? updatedCategory : c))
      toast({
        title: updatedCategory.is_popular ? 'Lagt til i populære' : 'Fjernet fra populære',
        description: `${category.name} har blitt ${updatedCategory.is_popular ? 'lagt til i' : 'fjernet fra'} populære kategorier.`
      })
    } catch (error) {
      console.error('Error toggling popular status:', error)
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere kategori status.',
        variant: 'destructive'
      })
    }
  }

  const handleToggleFeatured = async (category: Category) => {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: category.name,
          description: category.description,
          icon: category.icon,
          is_popular: category.is_popular,
          is_featured: !category.is_featured
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update category')
      }

      const updatedCategory = await response.json()
      setCategories(categories.map(c => c.id === category.id ? updatedCategory : c))
      toast({
        title: updatedCategory.is_featured ? 'Lagt til i utvalgte' : 'Fjernet fra utvalgte',
        description: `${category.name} har blitt ${updatedCategory.is_featured ? 'lagt til i' : 'fjernet fra'} utvalgte kategorier.`
      })
    } catch (error) {
      console.error('Error toggling featured status:', error)
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere kategori status.',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete category')
      }

      setCategories(categories.filter(c => c.id !== categoryId))
      toast({
        title: 'Kategori slettet',
        description: 'Kategorien har blitt slettet.'
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: 'Feil',
        description: error instanceof Error ? error.message : 'Kunne ikke slette kategorien.',
        variant: 'destructive'
      })
    }
  }

  const handleAddCategory = async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
          icon: newCategory.icon,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category')
      }

      const createdCategory = await response.json()
      setCategories([...categories, createdCategory])
      setIsAddingCategory(false)
      setNewCategory({ name: '', icon: '', description: '' })
      toast({
        title: 'Kategori opprettet',
        description: 'Ny kategori har blitt lagt til.'
      })
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: 'Feil',
        description: error instanceof Error ? error.message : 'Kunne ikke opprette ny kategori.',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Kategorier</h2>
        <Button onClick={() => setIsAddingCategory(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Legg til Kategori
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Ingen kategorier funnet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.name}
              className="flex items-center justify-between p-3 bg-white rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <p className="font-medium">{category.name}</p>
                  {category.description && (
                    <p className="text-sm text-gray-500">{category.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePopular(category)}
                >
                  {category.is_popular ? 'Fjern fra Populære' : 'Legg til i Populære'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleFeatured(category)}
                >
                  {category.is_featured ? 'Fjern fra Utvalgte' : 'Legg til i Utvalgte'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Slett
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Legg til Ny Kategori</DialogTitle>
            <DialogDescription>
              Fyll ut informasjonen under for å opprette en ny kategori.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Navn</Label>
              <Input
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Ikon (emoji)</Label>
              <Input
                value={newCategory.icon}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, icon: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Beskrivelse (valgfritt)</Label>
              <Textarea
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
              Avbryt
            </Button>
            <Button onClick={handleAddCategory}>Legg til</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 