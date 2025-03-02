'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  file: File
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

export default function AddListing() {
  const router = useRouter()
  const { user } = useUser()
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
  const [photos, setPhotos] = useState<ListingPhoto[]>([])
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
      isCompleted: photos.length > 0
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
    
    if (value) {
      fetchBrands(value)
    }
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

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Ikke pålogget",
        description: "Du må være pålogget for å legge ut en annonse.",
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
    if (photos.length === 0) {
      toast({
        title: "Ingen bilder",
        description: "Du må laste opp minst ett bilde av gjenstanden.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // First create the listing
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
      
      const listingResponse = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      })
      
      if (!listingResponse.ok) {
        throw new Error('Failed to create listing')
      }
      
      const { id: listingId } = await listingResponse.json()
      
      // Then upload photos
      const uploadPromises = photos.map(async (photo) => {
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
      
      toast({
        title: "Annonse publisert!",
        description: "Din annonse er nå publisert og synlig for alle.",
      })
      
      // Redirect to listing page
      router.push(`/listings/${listingId}`)
      
    } catch (error) {
      console.error('Error creating listing:', error)
      toast({
        title: "Feil ved publisering",
        description: "Det oppstod en feil ved publisering av annonsen. Vennligst prøv igjen.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (listing.categoryId) {
      fetchBrands()
    }
  }, [listing.categoryId])

  const fetchBrands = async () => {
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

  const handleBrandChange = (value: string) => {
    const brand = brands.find(b => b.id === value)
    setSelectedBrand(brand || null)
    setListing({ ...listing, brandId: value })
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

  if (!user) {
    return <div>Vennligst logg inn for å opprette en annonse.</div>
  }

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Legg ut ny annonse</h1>

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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement brand request functionality
                            toast({
                              title: "Kommer snart",
                              description: "Muligheten for å foreslå nye merker kommer snart.",
                            })
                          }}
                        >
                          Foreslå nytt merke
                        </Button>
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
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={4}
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
            photos={photos}
            categoryName={selectedCategory?.name}
            brandName={selectedBrand?.name}
            onEdit={handleStepChange}
            onPublish={handleSubmit}
          />
        )}
      </MultiStepForm>
    </div>
  )
}

