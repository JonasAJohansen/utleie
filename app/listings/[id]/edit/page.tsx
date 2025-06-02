'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ImagePlus, X } from 'lucide-react'
import Image from 'next/image'

const listingSchema = z.object({
  name: z.string().min(1, 'Title is required').max(100, 'Title must be under 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be under 2000 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  location: z.string().min(1, 'Location is required'),
  categoryId: z.string().min(1, 'Category is required'),
})

type ListingFormValues = z.infer<typeof listingSchema>

interface EditListingPageProps {
  params: Promise<{ id: string }>
}

interface Category {
  id: string
  name: string
}

interface ListingPhoto {
  id: string
  url: string
  description: string
  isMain: boolean
  displayOrder: number
}

interface Listing {
  id: string
  name: string
  description: string
  price: number
  location: string
  categoryId: string
  photos: ListingPhoto[]
  userId: string
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [listing, setListing] = useState<Listing | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [photos, setPhotos] = useState<ListingPhoto[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      location: '',
      categoryId: '',
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolvedParams = await params
        const listingId = resolvedParams.id

        // Fetch listing data and categories in parallel
        const [listingResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/listings/${listingId}`),
          fetch('/api/categories')
        ])

        if (!listingResponse.ok) {
          throw new Error('Failed to fetch listing')
        }

        const listingData = await listingResponse.json()
        
        // Check if user owns this listing
        if (listingData.userId !== user?.id) {
          toast({
            title: "Access Denied",
            description: "You can only edit your own listings.",
            variant: "destructive",
          })
          router.push('/listings')
          return
        }

        setListing(listingData)
        setPhotos(listingData.photos || [])
        
        // Set form values
        form.reset({
          name: listingData.name,
          description: listingData.description,
          price: listingData.price,
          location: listingData.location,
          categoryId: listingData.categoryId,
        })

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load listing data.",
          variant: "destructive",
        })
        router.push('/listings')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [params, user, router, toast, form])

  const onSubmit = async (data: ListingFormValues) => {
    if (!listing) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update listing')
      }

      toast({
        title: "Success",
        description: "Your listing has been updated successfully.",
      })

      router.push(`/listings/${listing.id}`)
    } catch (error) {
      console.error('Error updating listing:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0 || !listing) return

    setUploadingPhoto(true)
    
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('photo', file)
        formData.append('listingId', listing.id)
        formData.append('description', file.name)

        const response = await fetch('/api/listings/photos', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const newPhoto = await response.json()
          setPhotos(prev => [...prev, newPhoto])
        }
      }
      
      toast({
        title: "Success",
        description: "Photos uploaded successfully.",
      })
    } catch (error) {
      console.error('Error uploading photos:', error)
      toast({
        title: "Error",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const response = await fetch(`/api/listings/photos/${photoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPhotos(prev => prev.filter(photo => photo.id !== photoId))
        toast({
          title: "Success",
          description: "Photo deleted successfully.",
        })
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast({
        title: "Error",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
          <Button onClick={() => router.push('/listings')}>
            Back to Listings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="What are you listing?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your item in detail..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per day (NOK)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Region" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <Image
                        src={photo.url}
                        alt={photo.description}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {photo.isMain && (
                        <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                    <ImagePlus className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500 mt-2">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>
                {uploadingPhoto && (
                  <p className="text-sm text-blue-600">Uploading photos...</p>
                )}
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/listings/${listing.id}`)}
                  className="w-1/2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Listing
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 