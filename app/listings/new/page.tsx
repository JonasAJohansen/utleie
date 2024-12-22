'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ImagePreview } from '@/components/ImagePreview'
import { Upload, Plus, X } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"

export default function AddListing() {
  const router = useRouter()
  const [listing, setListing] = useState({
    name: '',
    description: '',
    price: '',
    priceType: 'day',
    category: '',
    features: [] as string[],
    customFeatures: [] as string[],
    address: '',
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newFeature, setNewFeature] = useState('')

  const predefinedFeatures = [
    'Free Delivery',
    'Instant Book',
    'Pet Friendly',
    'Long Term Rental',
    'Damage Protection',
    'Flexible Cancellation',
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setListing({ ...listing, [e.target.name]: e.target.value })
  }

  const handleCategoryChange = (value: string) => {
    setListing({ ...listing, category: value })
  }

  const handlePriceTypeChange = (value: string) => {
    setListing({ ...listing, priceType: value })
  }

  const handleFeatureToggle = (feature: string) => {
    setListing(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleAddCustomFeature = () => {
    if (newFeature.trim()) {
      setListing(prev => ({
        ...prev,
        customFeatures: [...prev.customFeatures, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const handleRemoveCustomFeature = (feature: string) => {
    setListing(prev => ({
      ...prev,
      customFeatures: prev.customFeatures.filter(f => f !== feature)
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file))
      setPhotos([...photos, ...newPhotos])
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Here you would typically send the new listing data to your backend
      // Simulating an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('New listing:', { ...listing, photos })
      
      toast({
        title: "Listing created successfully!",
        description: "Your new listing has been added.",
      })
      router.push('/')
    } catch {
      toast({
        title: "Error",
        description: "An error occurred while creating the listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Select onValueChange={handleCategoryChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sports">Sports & Outdoors</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="home">Home & Garden</SelectItem>
                    <SelectItem value="vehicles">Vehicles</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={listing.address}
                  onChange={handleChange}
                  placeholder="Enter the full address of the item"
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div>
                <Label>Price Type</Label>
                <RadioGroup defaultValue="day" onValueChange={handlePriceTypeChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hour" id="hour" />
                    <Label htmlFor="hour">Per Hour</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="day" id="day" />
                    <Label htmlFor="day">Per Day</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="week" id="week" />
                    <Label htmlFor="week">Per Week</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div>
              <Label>Features</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {predefinedFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={listing.features.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    <label
                      htmlFor={feature}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Custom Features</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a custom feature"
                />
                <Button type="button" onClick={handleAddCustomFeature} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              {listing.customFeatures.length > 0 && (
                <div className="mt-2 space-y-2">
                  {listing.customFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <span>{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCustomFeature(feature)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="photos">Photos</Label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="photos" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <span>Upload photos</span>
                      <Input id="photos" name="photos" type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              <ImagePreview images={photos} onRemove={removePhoto} />
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

