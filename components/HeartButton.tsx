'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Heart } from 'lucide-react'

interface HeartButtonProps {
  itemId: number
  initialLiked?: boolean
}

export function HeartButton({ itemId, initialLiked = false }: HeartButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked)

  const handleLike = () => {
    // In a real application, you would send a request to your backend here
    // to save the item to the user's favorites
    setIsLiked(!isLiked)
    console.log(`Item ${itemId} ${!isLiked ? 'liked' : 'unliked'}`)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleLike}
      aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
    </Button>
  )
}

