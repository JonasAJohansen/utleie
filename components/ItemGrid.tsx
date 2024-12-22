import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface Item {
  id: number
  name: string
  price: number
  image: string
  rating: number
  location: string
  priceType: string
  features: string[]
}

interface ItemGridProps {
  items: Item[]
}

export function ItemGrid({ items = [] }: ItemGridProps) {
  if (!items || items.length === 0) {
    return <p>No items available.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Link href={`/listings/${item.id}`} key={item.id} className="block">
          <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <div className="relative h-48">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-2">${item.price}/{item.priceType}</p>
              <div className="flex items-center mb-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1">{item.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {item.location}
              </div>
              <div className="flex flex-wrap gap-1">
                {item.features && item.features.slice(0, 2).map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {item.features && item.features.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{item.features.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

