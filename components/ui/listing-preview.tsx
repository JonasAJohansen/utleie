import Image from 'next/image'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Star, MapPin, DollarSign, Edit2 } from 'lucide-react'
import { Badge } from './badge'

interface ListingPreviewProps {
  listing: {
    name: string
    description: string
    price: string
    categoryId: string
    location: string
    condition: string
    brandId: string
  }
  photos: Array<{
    file: File
    description: string
    previewUrl: string
    isMain: boolean
  }>
  categoryName?: string
  brandName?: string
  onEdit: (step: number) => void
  onPublish: () => void
}

const conditionLabels: Record<string, string> = {
  'helt_ny': 'Helt ny',
  'som_ny': 'Som ny',
  'pent_brukt': 'Pent brukt',
  'godt_brukt': 'Godt brukt'
}

export function ListingPreview({
  listing,
  photos,
  categoryName,
  brandName,
  onEdit,
  onPublish
}: ListingPreviewProps) {
  const mainPhoto = photos.find(p => p.isMain) || photos[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Forhåndsvisning av annonsen</h2>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Photo Gallery */}
            <div className="space-y-4 p-6">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                {mainPhoto && (
                  <Image
                    src={mainPhoto.previewUrl}
                    alt={listing.name}
                    fill
                    className="object-cover"
                  />
                )}
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => onEdit(1)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {photos.filter(p => !p.isMain).map((photo, index) => (
                  <div key={photo.previewUrl} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                    <Image
                      src={photo.previewUrl}
                      alt={`Bilde ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Listing Details */}
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold">
                      {listing.name}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ml-2 h-6 w-6"
                        onClick={() => onEdit(0)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                      {categoryName && (
                        <Badge variant="secondary">
                          {categoryName}
                        </Badge>
                      )}
                      {brandName && (
                        <Badge variant="outline">
                          {brandName}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#4CD964]">
                    {listing.price} kr<span className="text-sm font-normal text-muted-foreground">/dag</span>
                  </div>
                </div>

                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {listing.location}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-2 h-6 w-6"
                    onClick={() => onEdit(3)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Beskrivelse</h3>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => onEdit(2)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tilstand</h3>
                  <Badge variant="outline">
                    {conditionLabels[listing.condition as keyof typeof conditionLabels]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => onEdit(3)}>
          Tilbake
        </Button>
        <Button onClick={onPublish} className="bg-[#4CD964] hover:bg-[#3DAF50]">
          Publiser annonse
        </Button>
      </div>
    </div>
  )
} 