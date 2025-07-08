'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BrandRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
  categoryName?: string
}

export function BrandRequestDialog({
  isOpen,
  onClose,
  categoryId,
  categoryName
}: BrandRequestDialogProps) {
  const [brandName, setBrandName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!brandName.trim()) {
      toast({
        title: 'Feil',
        description: 'Merkenavn er påkrevd',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/brand-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandName: brandName.trim(),
          categoryId,
          description: description.trim()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Forespørsel sendt',
          description: data.message || 'Merkeforespørselen din har blitt sendt.'
        })
        setBrandName('')
        setDescription('')
        onClose()
      } else {
        throw new Error(data.error || 'Kunne ikke sende forespørsel')
      }
    } catch (error) {
      console.error('Error submitting brand request:', error)
      toast({
        title: 'Feil',
        description: error instanceof Error ? error.message : 'Kunne ikke sende merkeforespørsel',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Foreslå nytt merke</DialogTitle>
          <DialogDescription>
            Foreslå et nytt merke for kategorien{' '}
            {categoryName ? `"${categoryName}"` : 'denne kategorien'}. Vi vil vurdere 
            forespørselen din og legge til merket hvis det er relevant.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brandName">Merkenavn *</Label>
            <Input
              id="brandName"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="F.eks. Sony, Apple, Samsung"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse (valgfritt)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv kort hvorfor dette merket bør legges til..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send forespørsel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 