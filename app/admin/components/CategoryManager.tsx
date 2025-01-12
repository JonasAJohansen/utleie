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

  const handleTogglePopular = async (category: Category) => {
    try {
      // TODO: Implement API call to toggle popular status
      const updatedCategory = { ...category, is_popular: !category.is_popular }
      setCategories(categories.map(c => c.id === category.id ? updatedCategory : c))
      toast({
        title: updatedCategory.is_popular ? 'Lagt til i populære' : 'Fjernet fra populære',
        description: `${category.name} har blitt ${updatedCategory.is_popular ? 'lagt til i' : 'fjernet fra'} populære kategorier.`
      })
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere kategori status.',
        variant: 'destructive'
      })
    }
  }

  const handleToggleFeatured = async (category: Category) => {
    try {
      // TODO: Implement API call to toggle featured status
      const updatedCategory = { ...category, is_featured: !category.is_featured }
      setCategories(categories.map(c => c.id === category.id ? updatedCategory : c))
      toast({
        title: updatedCategory.is_featured ? 'Lagt til i utvalgte' : 'Fjernet fra utvalgte',
        description: `${category.name} har blitt ${updatedCategory.is_featured ? 'lagt til i' : 'fjernet fra'} utvalgte kategorier.`
      })
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere kategori status.',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // TODO: Implement API call to delete category
      setCategories(categories.filter(c => c.id !== categoryId))
      toast({
        title: 'Kategori slettet',
        description: 'Kategorien har blitt slettet.'
      })
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke slette kategorien.',
        variant: 'destructive'
      })
    }
  }

  const handleAddCategory = async () => {
    try {
      // TODO: Implement API call to add new category
      const newCategoryWithId = {
        id: Date.now().toString(), // Temporary ID generation
        ...newCategory,
        is_active: true,
        is_popular: false,
        is_featured: false
      }
      setCategories([...categories, newCategoryWithId])
      setIsAddingCategory(false)
      setNewCategory({ name: '', icon: '', description: '' })
      toast({
        title: 'Kategori opprettet',
        description: 'Ny kategori har blitt lagt til.'
      })
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke opprette ny kategori.',
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