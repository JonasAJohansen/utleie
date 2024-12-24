'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ListingPhoto {
  id: string
  url: string
  description: string
  isMain: boolean
  displayOrder: number
}

export default function ListingGallery({ photos }: { photos: ListingPhoto[] }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!photos || photos.length === 0) {
    return (
      <div className="relative h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <ImageIcon className="mx-auto h-12 w-12 mb-2" />
          <p>No photos available</p>
        </div>
      </div>
    )
  }

  const mainPhoto = photos.find(p => p.isMain) || photos[0]
  const otherPhotos = photos.filter(p => p !== mainPhoto)

  const handlePrevPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4">
      <div className="relative h-96 rounded-lg overflow-hidden">
        <Image
          src={mainPhoto.url}
          alt="Main photo"
          fill
          className="object-cover cursor-pointer"
          onClick={() => {
            setSelectedPhotoIndex(photos.indexOf(mainPhoto))
            setIsDialogOpen(true)
          }}
        />
      </div>
      {otherPhotos.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {otherPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative h-32 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => {
                setSelectedPhotoIndex(photos.indexOf(photo))
                setIsDialogOpen(true)
              }}
            >
              <Image
                src={photo.url}
                alt={`Photo ${index + 2}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Photo Gallery</DialogTitle>
            <DialogDescription>
              {photos[selectedPhotoIndex].description}
            </DialogDescription>
          </DialogHeader>
          <div className="relative h-[60vh]">
            <Image
              src={photos[selectedPhotoIndex].url}
              alt={`Photo ${selectedPhotoIndex + 1}`}
              fill
              className="object-contain"
            />
            <button
              onClick={handlePrevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 