'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { useUser } from "@clerk/nextjs"
import { CategorySelect } from '@/components/CategorySelect'
import Image from 'next/image'
import { X, ImagePlus } from 'lucide-react'

interface ListingPhoto {
  file: File
  description: string
  previewUrl: string
  isMain: boolean
}

export default function AddListing() {
  const router = useRouter()
  const { user } = useUser()
  const [listing, setListing] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
  })
  const [photos, setPhotos] = useState<ListingPhoto[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setListing({ ...listing, [e.target.name]: e.target.value })
  }

  const handleCategoryChange = (value: string) => {
    setListing({ ...listing, categoryId: value })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && photos.length < 4) {
      const file = files[0]
      const previewUrl = URL.createObjectURL(file)
      const isMain = photos.length === 0 // First photo is main by default
      
      setPhotos([...photos, {
        file,
        description: '',
        previewUrl,
        isMain
      }])
    }
  }

  const handlePhotoDescriptionChange = (index: number, description: string) => {
    const newPhotos = [...photos]
    newPhotos[index].description = description
    setPhotos(newPhotos)
  }

  const handleSetMainPhoto = (index: number) => {
    const newPhotos = photos.map((photo, i) => ({
      ...photo,
      isMain: i === index
    }))
    setPhotos(newPhotos)
  }

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    // If we removed the main photo, make the first remaining photo the main one
    if (photos[index].isMain && newPhotos.length > 0) {
      newPhotos[0].isMain = true
    }
    setPhotos(newPhotos)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload all photos
      const uploadedPhotos = await Promise.all(photos.map(async (photo, index) => {
        const formData = new FormData()
        formData.append('file', photo.file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload image')
        }

        const { url } = await response.json()
        return {
          url,
          description: photo.description,
          isMain: photo.isMain,
          displayOrder: index
        }
      }))

      // Create the listing with photos
      const listingResponse = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...listing,
          photos: uploadedPhotos,
        }),
      })

      if (!listingResponse.ok) {
        throw new Error('Failed to create listing')
      }

      const newListing = await listingResponse.json()
      
      toast({
        title: "Listing created successfully!",
        description: "Your new listing has been added.",
      })
      router.push(`/listings/${newListing.id}`)
    } catch (error) {
      console.error('Error creating listing:', error)
      toast({
        title: "Error",
        description: "An error occurred while creating the listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return <div>Please sign in to create a listing.</div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add a New Listing</h1>
      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                name="name"
                value={listing.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <CategorySelect
                value={listing.categoryId}
                onChange={handleCategoryChange}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={listing.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={listing.price}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Photos (Max 4)</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image
                        src={photo.previewUrl}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 space-y-2">
                      <Input
                        placeholder="Add a description"
                        value={photo.description}
                        onChange={(e) => handlePhotoDescriptionChange(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant={photo.isMain ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleSetMainPhoto(index)}
                      >
                        {photo.isMain ? 'Main Photo' : 'Set as Main'}
                      </Button>
                    </div>
                  </div>
                ))}
                {photos.length < 4 && (
                  <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <ImagePlus className="mx-auto h-8 w-8 text-gray-400" />
                      <span className="mt-2 block text-sm text-gray-600">
                        Add Photo
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || photos.length === 0}>
              {isSubmitting ? 'Creating...' : 'Create Listing'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

