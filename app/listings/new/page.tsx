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

export default function AddListing() {
  const router = useRouter()
  const { user } = useUser()
  const [listing, setListing] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setListing({ ...listing, [e.target.name]: e.target.value })
  }

  const handleCategoryChange = (value: string) => {
    setListing({ ...listing, categoryId: value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      // Create a preview URL for the selected image
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageUrl = ''
      
      if (selectedImage) {
        // First, get a presigned URL for the upload
        const formData = new FormData()
        formData.append('file', selectedImage)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to get upload URL')
        }

        const { url } = await response.json()
        imageUrl = url
      }

      // Create the listing with the image URL
      const listingResponse = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...listing,
          image: imageUrl,
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
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              {previewUrl && (
                <div className="mt-4">
                  <Label>Preview</Label>
                  <div className="relative w-full h-48 mt-2 rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Listing'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

