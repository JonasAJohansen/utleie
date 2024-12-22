'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Calendar, Package } from 'lucide-react'
import { RentalHistory } from '@/components/RentalHistory'

// This would typically come from a database or API
const userBookings = [
  { id: 1, itemName: 'Mountain Bike', startDate: '2023-07-01', endDate: '2023-07-03', totalPrice: 75, image: '/placeholder.svg?height=100&width=100' },
  { id: 2, itemName: 'Camping Tent', startDate: '2023-07-15', endDate: '2023-07-17', totalPrice: 90, image: '/placeholder.svg?height=100&width=100' },
]

const userListings = [
  { id: 1, name: 'Surfboard', price: 35, image: '/placeholder.svg?height=200&width=300', rating: 4.8, location: 'Los Angeles, CA' },
  { id: 2, name: 'Mountain Bike', price: 25, image: '/placeholder.svg?height=200&width=300', rating: 4.7, location: 'Denver, CO' },
]

const rentalHistory = [
  { id: 1, itemName: 'DSLR Camera', startDate: '2023-06-10', endDate: '2023-06-12', totalPrice: 120, status: 'completed', location: 'New York, NY' },
  { id: 2, itemName: 'Electric Scooter', startDate: '2023-06-20', endDate: '2023-06-22', totalPrice: 45, status: 'completed', location: 'San Francisco, CA' },
  { id: 3, itemName: 'Mountain Bike', startDate: '2023-07-01', endDate: '2023-07-03', totalPrice: 75, status: 'active', location: 'Denver, CO' },
  { id: 4, itemName: 'Camping Tent', startDate: '2023-07-15', endDate: '2023-07-17', totalPrice: 90, status: 'active', location: 'Portland, OR' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('bookings')

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">My Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="history">Rental History</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {userBookings.map((booking) => (
                <div key={booking.id} className="flex items-center space-x-4 mb-4 p-4 border rounded-lg">
                  <Image src={booking.image} alt={booking.itemName} width={100} height={100} className="rounded-md" />
                  <div>
                    <h3 className="font-semibold">{booking.itemName}</h3>
                    <p className="text-sm text-gray-600">
                      <Calendar className="inline-block w-4 h-4 mr-1" />
                      {booking.startDate} to {booking.endDate}
                    </p>
                    <p className="font-medium">${booking.totalPrice}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>My Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userListings.map((listing) => (
                  <Card key={listing.id}>
                    <CardContent className="p-0">
                      <Image src={listing.image} alt={listing.name} width={300} height={200} className="w-full h-48 object-cover rounded-t-lg" />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{listing.name}</h3>
                        <p className="text-gray-600 mb-2">${listing.price}/day</p>
                        <div className="flex items-center mb-2">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="ml-1">{listing.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {listing.location}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button asChild className="mt-6">
                <Link href="/listings/new">
                  <Package className="mr-2 h-4 w-4" /> Add New Listing
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <RentalHistory rentals={rentalHistory} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

