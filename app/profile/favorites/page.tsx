import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, MapPin } from 'lucide-react'

// This would typically come from a database
const favorites = [
  { id: 1, name: 'DSLR Camera', price: 40, image: '/placeholder.svg?height=200&width=300', rating: 4.8, location: 'New York, NY', priceType: 'day' },
  { id: 2, name: 'Electric Scooter', price: 15, image: '/placeholder.svg?height=200&width=300', rating: 4.6, location: 'San Francisco, CA', priceType: 'day' },
]

export default function FavoritesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Favorites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((item) => (
            <Link key={item.id} href={`/listings/${item.id}`}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                <Image src={item.image} alt={item.name} width={300} height={200} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-2">${item.price}/{item.priceType}</p>
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1">{item.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {item.location}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

