'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useUser } from "@clerk/nextjs"
import { CategorySelect } from '@/components/CategorySelect'
import { LocationSelector, getLocationByValue } from '@/components/ui/location-selector'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiStepForm } from '@/components/ui/multi-step-form'
import { PhotoUpload } from '@/components/ui/photo-upload'
import { AlertCircle, HelpCircle, Loader2 } from 'lucide-react'
import { ListingPreview } from '@/components/ui/listing-preview'

// Import locations from location selector
import { locations } from '@/components/ui/location-selector'

interface ListingPhoto {
  id?: string
  file: File 
  url?: string
  description: string
  previewUrl: string
  isMain: boolean
}

interface Category {
  id: string
  name: string
  description?: string
  parent_id?: string | null
}

interface Brand {
  id: string
  name: string
  category_id: string
}

// Define item conditions
const itemConditions = [
  { value: 'helt_ny', label: 'Helt ny' },
  { value: 'som_ny', label: 'Som ny' },
  { value: 'pent_brukt', label: 'Pent brukt' },
  { value: 'godt_brukt', label: 'Godt brukt' },
]

export default function EditListing() {
  const router = useRouter()
  const params = useParams()
  const listingId = Array.isArray(params.id) ? params.id[0] : params.id
  
  const { user, isLoaded } = useUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [listing, setListing] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    brandId: '',
    location: '',
    latitude: '',
    longitude: '',
    radius: 2, // Default radius of 2km for privacy
    condition: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [photos, setPhotos] = useState<ListingPhoto[]>([])
  const [existingPhotos, setExistingPhotos] = useState<ListingPhoto[]>([])
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [isFetchingBrands, setIsFetchingBrands] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)

  const steps = [
    {
      title: 'Grunnleggende info',
      description: 'Navn, kategori og tilstand',
      isCompleted: !!listing.name && !!listing.categoryId && !!listing.condition
    },
    {
      title: 'Bilder',
      description: 'Last opp bilder',
      isCompleted: photos.length > 0 || existingPhotos.length > 0
    },
    {
      title: 'Detaljer',
      description: 'Beskrivelse og pris',
      isCompleted: !!listing.description && !!listing.price
    },
    {
      title: 'Lokasjon',
      description: 'Hvor er gjenstanden?',
      isCompleted: !!listing.location
    },
    {
      title: 'Forhåndsvisning',
      description: 'Se over og publiser',
      isCompleted: false
    }
  ]

  // Fetch the listing data
  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/listings/${listingId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch listing')
        }
        
        const data = await response.json()
        
        // Update the listing state with the fetched data
        setListing({
          name: data.name || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          categoryId: data.category_id || '',
          brandId: data.brand_id || '',
          location: data.location || '',
          latitude: data.latitude?.toString() || '',
          longitude: data.longitude?.toString() || '',
          radius: data.radius || 2,
          condition: data.condition || '',
        })
        
        // Fetch listing photos
        const photosResponse = await fetch(`/api/listings/${listingId}/photos`)
        if (photosResponse.ok) {
          const photosData = await photosResponse.json()
          // Transform photos data
          const transformedPhotos = photosData.map((photo: any) => ({
            id: photo.id,
            url: photo.url,
            description: photo.description || '',
            previewUrl: photo.url,
            isMain: photo.is_main || false,
          }))
          setExistingPhotos(transformedPhotos)
        }
        
        // Set selected category for dropdowns
        if (data.category_id) {
          const category = categories.find(c => c.id === data.category_id)
          if (category) {
            setSelectedCategory(category)
          }
        }
        
        // Set selected brand if exists
        if (data.brand_id && brands.length > 0) {
          const brand = brands.find(b => b.id === data.brand_id)
          if (brand) {
            setSelectedBrand(brand)
          }
        }
      } catch (error) {
        console.error('Error fetching listing:', error)
        toast({
          title: 'Error',
          description: 'Failed to load listing data. Please try again.',
          variant: 'destructive',
        })
        // Redirect back to listings page if data can't be loaded
        router.push('/listings')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (listingId && isLoaded) {
      fetchListing()
    }
  }, [listingId, isLoaded, router, categories, brands, toast])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: 'Error',
          description: 'Failed to load categories. Please try again.',
          variant: 'destructive',
        })
      }
    }
    
    fetchCategories()
  }, [toast])

  // Fetch brands when category changes
  useEffect(() => {
    const fetchBrands = async () => {
      if (!listing.categoryId) return
      
      try {
        setIsFetchingBrands(true)
        const response = await fetch('/api/brands')
        if (!response.ok) throw new Error('Failed to fetch brands')
        const data = await response.json()
        const filteredBrands = data.filter((brand: any) => brand.category_id === listing.categoryId)
        setBrands(filteredBrands)
      } catch (error) {
        console.error('Error:', error)
        toast({
          title: "Error",
          description: "Failed to fetch brands",
          variant: "destructive",
        })
      } finally {
        setIsFetchingBrands(false)
      }
    }
    
    if (listing.categoryId) {
      fetchBrands()
    }
  }, [listing.categoryId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setListing({ ...listing, [e.target.name]: e.target.value })
  }

  const handleCategoryChange = (value: string) => {
    const category = categories.find(c => c.id === value)
    setSelectedCategory(category || null)
    setListing({ ...listing, categoryId: value })
    
    // Reset brand when category changes
    setSelectedBrand(null)
    setListing(prev => ({ ...prev, brandId: '' }))
  }

  const handleBrandChange = (value: string) => {
    const brand = brands.find(b => b.id === value)
    setSelectedBrand(brand || null)
    setListing({ ...listing, brandId: value })
  }

  const handleLocationChange = (value: string) => {
    // Get location data including coordinates
    const locationData = getLocationByValue(value);
    
    if (locationData) {
      // Add approximately 100-500m random offset for privacy
      const randomOffsetLat = (Math.random() - 0.5) * 0.005;
      const randomOffsetLng = (Math.random() - 0.5) * 0.005;
      
      setListing({
        ...listing,
        location: value,
        latitude: (locationData.lat + randomOffsetLat).toString(),
        longitude: (locationData.lng + randomOffsetLng).toString(),
        radius: locationData.radius || 2
      });
    } else {
      setListing({
        ...listing,
        location: value,
        latitude: '',
        longitude: '',
        radius: 2
      });
    }
  }

  const handleConditionChange = (value: string) => {
    setListing({ ...listing, condition: value })
  }

  const handleDeletePhoto = (photoId: string) => {
    setExistingPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId))
    if (photoId) {
      setPhotosToDelete(prev => [...prev, photoId])
    }
  }

  const handlePhotoChange = (updatedPhotos: ListingPhoto[]) => {
    setPhotos(updatedPhotos.filter(p => !p.id)) // Filter out existing photos
  }

  const handleAllPhotosChange = (updatedPhotos: ListingPhoto[]) => {
    // Separate existing and new photos
    const existing = updatedPhotos.filter(p => p.id)
    const newPhotos = updatedPhotos.filter(p => !p.id)
    
    setExistingPhotos(existing)
    setPhotos(newPhotos)
  }

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Ikke pålogget",
        description: "Du må være pålogget for å redigere annonsen.",
        variant: "destructive",
      })
      return
    }
    
    // Validate required fields
    if (!listing.name || !listing.description || !listing.price || !listing.categoryId || !listing.location) {
      toast({
        title: "Manglende informasjon",
        description: "Vennligst fyll ut alle påkrevde felt.",
        variant: "destructive",
      })
      return
    }
    
    // Validate photos
    if (photos.length === 0 && existingPhotos.length === 0) {
      toast({
        title: "Ingen bilder",
        description: "Du må ha minst ett bilde av gjenstanden.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Update the listing
      const listingData = {
        name: listing.name,
        description: listing.description,
        price: parseFloat(listing.price),
        categoryId: listing.categoryId,
        brandId: listing.brandId || null,
        condition: listing.condition,
        location: listing.location,
        latitude: listing.latitude,
        longitude: listing.longitude,
        radius: listing.radius
      }
      
      const updateResponse = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      })
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update listing')
      }
      
      // Delete photos that were removed
      if (photosToDelete.length > 0) {
        for (const photoId of photosToDelete) {
          const deleteResponse = await fetch(`/api/listings/photos/${photoId}`, {
            method: 'DELETE',
          })
          
          if (!deleteResponse.ok) {
            console.error(`Failed to delete photo ${photoId}`)
          }
        }
      }
      
      // Upload new photos
      if (photos.length > 0) {
        const uploadPromises = photos.map(async (photo) => {
          if (!photo.file) return null
          
          const formData = new FormData()
          formData.append('file', photo.file)
          formData.append('listingId', listingId)
          formData.append('description', photo.description)
          formData.append('isMain', photo.isMain ? 'true' : 'false')
          
          const photoResponse = await fetch('/api/listings/photos', {
            method: 'POST',
            body: formData,
          })
          
          if (!photoResponse.ok) {
            throw new Error('Failed to upload photos')
          }
          
          return photoResponse.json()
        })
        
        await Promise.all(uploadPromises)
      }
      
      toast({
        title: "Annonse oppdatert!",
        description: "Din annonse er nå oppdatert.",
      })
      
      // Redirect to listing page
      router.push(`/listings/${listingId}`)
      
    } catch (error) {
      console.error('Error updating listing:', error)
      toast({
        title: "Feil ved oppdatering",
        description: "Det oppstod en feil ved oppdatering av annonsen. Vennligst prøv igjen.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStepChange = (step: number) => {
    // Allow going back to any step
    if (step < currentStep) {
      setCurrentStep(step)
      return
    }

    // Check if current step is completed before proceeding
    if (!steps[currentStep].isCompleted) {
      toast({
        title: "Fullfør dette steget",
        description: "Vennligst fyll ut all nødvendig informasjon før du går videre.",
        variant: "destructive",
      })
      return
    }

    // If all previous steps are completed, proceed
    if (steps.slice(0, step).every(s => s.isCompleted)) {
      setCurrentStep(step)
    }
  }

  if (!isLoaded) {
    return <div className="container max-w-3xl mx-auto py-8 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  }

  if (!user) {
    return <div className="container max-w-3xl mx-auto py-8">Vennligst logg inn for å redigere annonsen.</div>
  }

  if (isLoading) {
    return <div className="container max-w-3xl mx-auto py-8 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Laster annonse...</span>
    </div>
  }

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Rediger annonse</h1>

      <MultiStepForm
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
      >
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Gjenstandens navn</Label>
              <Input
                id="name"
                name="name"
                value={listing.name}
                onChange={handleChange}
                placeholder="F.eks. 'Sony PlayStation 5' eller 'Bosch Drill'"
                required
              />
              <p className="text-sm text-muted-foreground">
                Gi en kort og beskrivende tittel som hjelper folk å finne gjenstanden din.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <CategorySelect
                value={listing.categoryId}
                onChange={handleCategoryChange}
              />
              <p className="text-sm text-muted-foreground">
                Velg en kategori som best beskriver gjenstanden din.
              </p>
            </div>

            {listing.categoryId && (
              <div className="space-y-2">
                <Label htmlFor="brand">Merke</Label>
                {isFetchingBrands ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Henter merker...</span>
                  </div>
                ) : brands.length > 0 ? (
                  <>
                    <Select value={listing.brandId} onValueChange={handleBrandChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg merke" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Velg merket på gjenstanden din. Dette hjelper potensielle leietakere med å finne det de leter etter.
                    </p>
                  </>
                ) : (
                  <div className="rounded-md bg-muted p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Ingen merker funnet for denne kategorien</p>
                        <p className="text-sm text-muted-foreground">
                          Vi har ikke registrert noen merker for denne kategorien ennå. 
                          Du kan fortsette uten å velge merke, eller kontakte oss for å få lagt til et nytt merke.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="condition">Tilstand</Label>
              <Select value={listing.condition} onValueChange={handleConditionChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Velg tilstand" />
                </SelectTrigger>
                <SelectContent>
                  {itemConditions.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Velg tilstanden som best beskriver gjenstanden din. Vær ærlig - dette bygger tillit med leietakere.
              </p>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <PhotoUpload
              photos={[
                ...existingPhotos.map(photo => ({
                  ...photo, 
                  // Create a File object from the URL to satisfy the type requirement
                  file: new File([], photo.url || '', { type: 'image/jpeg' })
                })), 
                ...photos
              ]}
              onPhotosChange={handleAllPhotosChange}
              maxPhotos={4}
              onDeletePhoto={handleDeletePhoto}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                name="description"
                value={listing.description}
                onChange={handleChange}
                placeholder="Beskriv gjenstanden din i detalj. Inkluder relevant informasjon som størrelse, farge, tilstand, etc."
                rows={6}
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
              <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <HelpCircle className="h-4 w-4 mt-0.5" />
                <p>
                  Sett en konkurransedyktig pris. Du kan sjekke lignende annonser for å få en idé om prisnivået.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="location">Sted</Label>
              <LocationSelector
                value={listing.location}
                onChange={handleLocationChange}
              />
              <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p>
                  Velg stedet hvor gjenstanden kan hentes og leveres. Dette hjelper potensielle leietakere med å planlegge.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <ListingPreview
            listing={listing}
            photos={[...existingPhotos, ...photos]}
            categoryName={selectedCategory?.name}
            brandName={selectedBrand?.name}
            onEdit={handleStepChange}
            onPublish={handleSubmit}
            isEditing={true}
          />
        )}
      </MultiStepForm>
    </div>
  )
} 