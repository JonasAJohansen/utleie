import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface ImagePreviewProps {
  images: string[]
  onRemove: (index: number) => void
}

export function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  if (images.length === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <Image 
            src={image} 
            alt={`Uploaded image ${index + 1}`} 
            width={200} 
            height={200} 
            className="rounded-md object-cover w-full h-40"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}

