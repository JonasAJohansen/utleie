'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface HeartButtonProps {
  itemId: string
  onHeartChange?: (isHearted: boolean) => void
}

export function HeartButton({ itemId, onHeartChange }: HeartButtonProps) {
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isHearted, setIsHearted] = useState(false)
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
      const response = await fetch(`/api/favorites/${itemId}`)
      if (response.ok) {
        const data = await response.json()
        setIsHearted(data.isFavorite)
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleHeart = async () => {
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
      const response = await fetch('/api/favorites', {
        method: isHearted ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId: itemId }),
      })

      if (!response.ok) {
        throw new Error('Failed to update favorite status')
      }

      setIsHearted(!isHearted)
      onHeartChange?.(!isHearted)

      toast({
        title: isHearted ? "Removed from favorites" : "Added to favorites",
        description: isHearted ? "Item removed from your favorites" : "Item added to your favorites",
      })
    } catch (error) {
      console.error('Error toggling heart:', error)
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleHeart}
      disabled={isLoading}
      className={isHearted ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-600'}
    >
      <Heart className={`h-7 w-7 ${isHearted ? 'fill-current' : ''}`} />
    </Button>
  )
}

