'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface HeartButtonProps {
  itemId: string
  className?: string
}

export function HeartButton({ itemId, className }: HeartButtonProps) {
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isSignedIn) {
      checkIfFavorite()
    } else {
      setIsLoading(false)
    }
  }, [isSignedIn, itemId])

  const checkIfFavorite = async () => {
    try {
      const response = await fetch(`/api/favorites`)
      if (response.ok) {
        const favorites = await response.json()
        setIsFavorite(favorites.some((fav: any) => fav.listing_id === itemId))
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      if (isFavorite) {
        const response = await fetch(`/api/favorites/${itemId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setIsFavorite(false)
          toast({
            title: "Success",
            description: "Item removed from wishlist",
          })
        }
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ listingId: itemId }),
        })
        if (response.ok) {
          setIsFavorite(true)
          toast({
            title: "Success",
            description: "Item added to wishlist",
          })
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={toggleFavorite}
      disabled={isLoading}
      variant="ghost"
      size="icon"
      className={className}
    >
      <Heart
        className={`h-6 w-6 ${isFavorite ? 'fill-current text-red-500' : 'text-gray-500'}`}
      />
    </Button>
  )
}

