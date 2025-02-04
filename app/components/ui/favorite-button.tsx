'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface FavoriteButtonProps {
  listingId: string
  initialIsFavorited?: boolean
  onToggle?: (isFavorited: boolean) => void
}

export function FavoriteButton({
  listingId,
  initialIsFavorited = false,
  onToggle
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const toggleFavorite = async () => {
    try {
      setIsLoading(true)
      const method = isFavorited ? 'DELETE' : 'POST'
      const response = await fetch('/api/favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to toggle favorite')
      }

      const newIsFavorited = !isFavorited
      setIsFavorited(newIsFavorited)
      onToggle?.(newIsFavorited)

      toast({
        title: newIsFavorited ? 'Added to favorites' : 'Removed from favorites',
        description: newIsFavorited 
          ? 'This listing has been added to your favorites.'
          : 'This listing has been removed from your favorites.',
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`
        hover:bg-background/80 hover:text-foreground
        ${isFavorited ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}
      `}
      disabled={isLoading}
      onClick={toggleFavorite}
    >
      <Heart
        className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`}
      />
      <span className="sr-only">
        {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      </span>
    </Button>
  )
} 