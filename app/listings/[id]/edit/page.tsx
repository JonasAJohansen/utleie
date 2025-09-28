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
import { Loader2, ImagePlus, X, Trash2, Crown } from 'lucide-react'
import Image from 'next/image'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { SponsorshipModal } from '@/components/sponsorship/SponsorshipModal'

const listingSchema = z.object({
  name: z.string().min(1, 'Tittel er påkrevd').max(100, 'Tittel må være under 100 tegn'),
  description: z.string().min(10, 'Beskrivelse må være minst 10 tegn').max(2000, 'Beskrivelse må være under 2000 tegn'),
  price: z.number().min(0, 'Pris kan ikke være negativ'),
  location: z.string().min(1, 'Lokasjon er påkrevd'),
  categoryId: z.string().min(1, 'Kategori er påkrevd'),
}).refine((data) => {
  // If Gis Bort is selected, price must be 0
  if (data.categoryId === 'Gis Bort') {
    return data.price === 0
  }
  // For other categories, price must be greater than 0
  return data.price > 0
}, {
  message: 'Pris må være større enn 0 for vanlige annonser, eller 0 for Gis Bort gjenstander',
  path: ['price']
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
  const [isDeleting, setIsDeleting] = useState(false)
  const [showSponsorshipModal, setShowSponsorshipModal] = useState(false)

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

  // Watch categoryId to conditionally show/hide price field
  const watchedCategoryId = form.watch('categoryId')

  // Auto-set price to 0 when Gis Bort is selected
  useEffect(() => {
    if (watchedCategoryId === 'Gis Bort') {
      form.setValue('price', 0)
    }
  }, [watchedCategoryId, form])

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
            title: "Tilgang nektet",
            description: "Du kan kun redigere dine egne annonser.",
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
          // Deduplicate categories by name to prevent React key conflicts
          const uniqueCategories = categoriesData.filter((category: Category, index: number, self: Category[]) => 
            index === self.findIndex(c => c.name === category.name)
          )
          console.log('Categories data:', { original: categoriesData.length, unique: uniqueCategories.length })
          setCategories(uniqueCategories)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Feil",
          description: "Kunne ikke laste annonsedata.",
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
        title: "Suksess",
        description: "Annonsen din har blitt oppdatert.",
      })

      router.push(`/listings/${listing.id}`)
    } catch (error) {
      console.error('Error updating listing:', error)
      toast({
        title: "Feil",
        description: error instanceof Error ? error.message : "Kunne ikke oppdatere annonse. Prøv igjen.",
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
        title: "Suksess",
        description: "Bilder lastet opp.",
      })
    } catch (error) {
      console.error('Error uploading photos:', error)
      toast({
        title: "Feil",
        description: "Kunne ikke laste opp bilder. Prøv igjen.",
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
          title: "Suksess",
          description: "Bilde slettet.",
        })
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast({
        title: "Feil",
        description: "Kunne ikke slette bilde. Prøv igjen.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteListing = async () => {
    if (!listing) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete listing')
      }

      toast({
        title: "Suksess",
        description: "Annonsen din har blitt slettet.",
      })

      router.push('/listings')
    } catch (error) {
      console.error('Error deleting listing:', error)
      toast({
        title: "Feil",
        description: error instanceof Error ? error.message : "Kunne ikke slette annonse. Prøv igjen.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
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
          <h1 className="text-2xl font-bold mb-4">Annonse ikke funnet</h1>
          <Button onClick={() => router.push('/listings')}>
            Tilbake til annonser
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Rediger annonse</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tittel</FormLabel>
                    <FormControl>
                      <Input placeholder="Hva leier du ut?" {...field} />
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
                    <FormLabel>Beskrivelse</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Beskriv gjenstanden din i detalj..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Only show price field if not Gis Bort */}
                {watchedCategoryId !== 'Gis Bort' && (
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pris per dag (NOK)</FormLabel>
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
                )}

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg en kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Hardcoded Gis Bort option - always available */}
                          <SelectItem key="gis-bort" value="Gis Bort">
                            🎁 Gis Bort (Gratis)
                          </SelectItem>
                          {categories.map((category, index) => (
                            <SelectItem key={`${category.id}-${index}`} value={category.id}>
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

              {/* Show free message when Gis Bort is selected */}
              {watchedCategoryId === 'Gis Bort' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <span className="text-xl">🎁</span>
                    <div>
                      <p className="font-semibold">Gratis å gi bort</p>
                      <p className="text-sm">Dette er en gratis gjenstand som gis bort uten kostnad.</p>
                    </div>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasjon</FormLabel>
                    <FormControl>
                      <Input placeholder="By, Region" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bilder</h3>
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
                          Hovedbilde
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                    <ImagePlus className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500 mt-2">Legg til bilde</span>
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
                  <p className="text-sm text-blue-600">Laster opp bilder...</p>
                )}
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/listings/${listing.id}`)}
                  className="w-1/3"
                >
                  Avbryt
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/3"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Oppdater annonse
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSponsorshipModal(true)}
                  disabled={isSubmitting || isDeleting}
                  className="w-1/4"
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Fremhev annonse
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isSubmitting || isDeleting}
                      className="w-1/4"
                    >
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Trash2 className="mr-2 h-4 w-4" />
                      Slett annonse
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Denne handlingen kan ikke angres. Dette vil permanent slette annonsen din og alle tilhørende data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Avbryt</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteListing}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Slett annonse
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Sponsorship Modal */}
      {listing && (
        <SponsorshipModal
          isOpen={showSponsorshipModal}
          onClose={() => setShowSponsorshipModal(false)}
          listingId={listing.id}
          listingTitle={listing.name}
          userName={user?.username || undefined}
          onSuccess={() => {
            setShowSponsorshipModal(false)
            toast({
              title: "Suksess",
              description: "Annonsen din er nå sponset!",
            })
          }}
        />
      )}
    </div>
  )
} 