'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Star, MapPin, ArrowRight } from 'lucide-react'


const allItems = [
  { id: 1, name: 'Mountain Bike', price: 25, image: '/placeholder.svg?height=200&width=300', rating: 4.5, location: 'Denver, CO', priceType: 'day', category: 'Sports & Outdoors', lat: 39.7392, lng: -104.9903 },
  { id: 2, name: 'DSLR Camera', price: 40, image: '/placeholder.svg?height=200&width=300', rating: 4.8, location: 'New York, NY', priceType: 'day', category: 'Electronics', lat: 40.7128, lng: -74.0060 },
  { id: 3, name: 'Camping Tent', price: 30, image: '/placeholder.svg?height=200&width=300', rating: 4.2, location: 'Portland, OR', priceType: 'day', category: 'Sports & Outdoors', lat: 45.5155, lng: -122.6789 },
  { id: 4, name: 'Surfboard', price: 35, image: '/placeholder.svg?height=200&width=300', rating: 4.7, location: 'Los Angeles, CA', priceType: 'day', category: 'Sports & Outdoors', lat: 34.0522, lng: -118.2437 },
  { id: 5, name: 'Electric Scooter', price: 15, image: '/placeholder.svg?height=200&width=300', rating: 4.6, location: 'San Francisco, CA', priceType: 'day', category: 'Vehicles', lat: 37.7749, lng: -122.4194 },
]

const popularCategories = [
  { id: 1, name: 'Sports & Outdoors', icon: '🚵‍♂️' },
  { id: 2, name: 'Electronics', icon: '📷' },
  { id: 3, name: 'Home & Garden', icon: '🏡' },
  { id: 4, name: 'Vehicles', icon: '🚗' },
  { id: 5, name: 'Fashion', icon: '👗' },
  { id: 6, name: 'Tools', icon: '🔧' },
]

const featuredCategories = [
  { id: 1, name: 'Summer Essentials', image: '/placeholder.svg?height=300&width=400', itemCount: 150 },
  { id: 2, name: 'Work from Home Gear', image: '/placeholder.svg?height=300&width=400', itemCount: 80 },
  { id: 3, name: 'Outdoor Adventure', image: '/placeholder.svg?height=300&width=400', itemCount: 200 },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }


  return (
    <div className="space-y-16">
      <section className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-24 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-6 leading-tight">Discover, Rent, and Experience</h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto">Find unique items to rent for your next adventure, project, or special occasion. Join our community of sharers today!</p>
          <form onSubmit={handleSearch} className="flex max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="What would you like to rent?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow rounded-r-none text-black text-lg py-6"
            />
            <Button type="submit" className="rounded-l-none bg-yellow-400 text-black hover:bg-yellow-500 text-lg py-6">
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </form>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {popularCategories.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.id}`}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <span className="text-5xl mb-4">{category.icon}</span>
              <span className="text-sm font-medium text-center">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCategories.map((category) => (
            <Link 
              key={category.id}
              href={`/category/${category.id}`}
              className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Image
                src={category.image}
                alt={category.name}
                width={400}
                height={300}
                className="object-cover w-full h-64 group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300 flex flex-col justify-end p-6">
                <h3 className="text-white text-2xl font-bold mb-2">{category.name}</h3>
                <p className="text-white text-sm">{category.itemCount} items available</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8">Popular Listings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allItems.slice(0, 4).map((item) => (
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
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {item.location}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-green-400 to-blue-500 text-white py-20 rounded-2xl">
        <div className="max-w-5xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white bg-opacity-20 p-8 rounded-xl">
              <div className="text-5xl mb-6">🔍</div>
              <h3 className="font-semibold text-2xl mb-4">1. Find an Item</h3>
              <p className="text-lg">Browse our extensive selection of items available for rent in your area.</p>
            </div>
            <div className="bg-white bg-opacity-20 p-8 rounded-xl">
              <div className="text-5xl mb-6">💬</div>
              <h3 className="font-semibold text-2xl mb-4">2. Request to Rent</h3>
              <p className="text-lg">Send a request to the owner and agree on rental terms and conditions.</p>
            </div>
            <div className="bg-white bg-opacity-20 p-8 rounded-xl">
              <div className="text-5xl mb-6">🎉</div>
              <h3 className="font-semibold text-2xl mb-4">3. Enjoy and Return</h3>
              <p className="text-lg">Use the item for your needs and return it in the agreed-upon condition.</p>
            </div>
          </div>
          <Button className="mt-12 bg-white text-blue-600 hover:bg-blue-50" size="lg">
            Start Renting Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">Connect with fellow renters and owners. Share experiences, get tips, and make the most of your rentals.</p>
        <Button size="lg">
          Sign Up Now
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>
    </div>
  )
}

