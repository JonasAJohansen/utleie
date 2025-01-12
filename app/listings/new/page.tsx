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
import { LocationSelector } from '@/components/ui/location-selector'
import Image from 'next/image'
import { X, ImagePlus } from 'lucide-react'

// Import locations from location selector
import { locations } from '@/components/ui/location-selector'

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
    location: '',
  })
  const [photos, setPhotos] = useState<ListingPhoto[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setListing({ ...listing, [e.target.name]: e.target.value })
  }

  const handleCategoryChange = (value: string) => {
    setListing({ ...listing, categoryId: value })
  }

  const handleLocationChange = (value: string) => {
    setListing({ ...listing, location: value })
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
        title: "Annonsen er opprettet!",
        description: "Din nye annonse er lagt ut.",
      })
      router.push(`/listings/${newListing.id}`)
    } catch (error) {
      console.error('Error creating listing:', error)
      toast({
        title: "Feil",
        description: "Det oppstod en feil under oppretting av annonsen. Vennligst prøv igjen.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return <div>Vennligst logg inn for å opprette en annonse.</div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Legg ut ny annonse</h1>
      <Card>
        <CardHeader>
          <CardTitle>Annonseinformasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Gjenstandens navn</Label>
              <Input
                id="name"
                name="name"
                value={listing.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Kategori</Label>
              <CategorySelect
                value={listing.categoryId}
                onChange={handleCategoryChange}
              />
            </div>
            <div>
              <Label htmlFor="location">Sted</Label>
              <LocationSelector
                value={listing.location}
                onChange={handleLocationChange}
              />
            </div>
            <div>
              <Label htmlFor="description">Beskrivelse</Label>
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
              <Label htmlFor="price">Pris per dag (NOK)</Label>
              <div className="relative">
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={listing.price}
                  onChange={handleChange}
                  className="pl-8"
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">kr</span>
              </div>
            </div>
            <div>
              <Label>Bilder (Maks 4)</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image
                        src={photo.previewUrl}
                        alt={`Bilde ${index + 1}`}
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
                        placeholder="Legg til beskrivelse"
                        value={photo.description}
                        onChange={(e) => handlePhotoDescriptionChange(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant={photo.isMain ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleSetMainPhoto(index)}
                      >
                        {photo.isMain ? 'Hovedbilde' : 'Sett som hovedbilde'}
                      </Button>
                    </div>
                  </div>
                ))}
                {photos.length < 4 && (
                  <label className="relative w-full h-48 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <div className="text-center">
                      <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                      <span className="mt-2 block text-sm text-gray-600">
                        Last opp bilde
                      </span>
                    </div>
                  </label>
                )}
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Oppretter annonse..." : "Opprett annonse"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

