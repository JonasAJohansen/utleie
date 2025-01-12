import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  is_active: boolean
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) throw new Error('Kunne ikke hente kategorier')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke hente kategorier. Vennligst prøv igjen.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      })

      if (!response.ok) throw new Error('Kunne ikke legge til kategori')

      const newCategory = await response.json()
      setCategories([...categories, newCategory])
      setNewCategoryName('')
      setDialogOpen(false)
      
      toast({
        title: "Suksess",
        description: "Kategorien ble lagt til.",
      })
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke legge til kategori. Vennligst prøv igjen.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne kategorien?')) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Kunne ikke slette kategori')

      setCategories(categories.filter(cat => cat.id !== id))
      toast({
        title: "Suksess",
        description: "Kategorien ble slettet.",
      })
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke slette kategori. Vennligst prøv igjen.",
        variant: "destructive",
      })
    }
  }

  const handleToggleCategory = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere kategori')

      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, is_active: !currentStatus } : cat
      ))
      
      toast({
        title: "Suksess",
        description: "Kategorien ble oppdatert.",
      })
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere kategori. Vennligst prøv igjen.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>Legg til ny kategori</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Legg til ny kategori</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <Label htmlFor="name">Kategorinavn</Label>
              <Input
                id="name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Legger til..." : "Legg til"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between p-2 bg-white rounded-lg shadow">
            <span>{category.name}</span>
            <div className="space-x-2">
              <Button
                variant={category.is_active ? "outline" : "default"}
                onClick={() => handleToggleCategory(category.id, category.is_active)}
              >
                {category.is_active ? "Deaktiver" : "Aktiver"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteCategory(category.id)}
              >
                Slett
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 