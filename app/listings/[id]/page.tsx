'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Star, MessageCircle, MapPin, DollarSign, Flag } from 'lucide-react'
import { UserReview } from '@/components/UserReview'
import { ScrollArea } from "@/components/ui/scroll-area"
import { RentalRequest } from '@/components/RentalRequest'
import { ReportDialog } from '@/components/ReportDialog'
import { HeartButton } from '@/components/HeartButton'
import { Badge } from "@/components/ui/badge"
import { ItemGrid } from '@/components/ItemGrid'

// This would typically come from a database
const item = {
  id: 1,
  name: 'Mountain Bike',
  description: 'A high-quality mountain bike perfect for off-road adventures. Features front suspension, 21 gears, and durable tires suitable for various terrains.',
  price: 25,
  images: [
    '/placeholder.svg?height=400&width=600',
    '/placeholder.svg?height=200&width=300&text=Additional+Image+1',
    '/placeholder.svg?height=200&width=300&text=Additional+Image+2',
    '/placeholder.svg?height=200&width=300&text=Additional+Image+3',
  ],
  location: 'Denver, CO',
  owner: {
    id: 'user123',
    name: 'John Doe',
    avatar: '/placeholder.svg?height=100&width=100',
    rating: 4.8,
    totalRentals: 52,
  },
  rating: 4.7,
  reviews: [
    { id: 1, username: 'Alice', avatar: '/placeholder.svg?height=50&width=50', rating: 5, date: '2023-06-15', comment: 'Great bike, smooth ride! John was very helpful and accommodating.' },
    { id: 2, username: 'Bob', avatar: '/placeholder.svg?height=50&width=50', rating: 4, date: '2023-06-10', comment: 'Good condition, but the gears need some adjustment. Overall, a positive experience.' },
  ],
  features: ['21-speed Shimano gears', 'Front suspension', 'Disc brakes', 'Lightweight aluminum frame'],
  policies: ['24-hour cancellation', 'Security deposit required', 'Helmet included'],
  renters: ['Alice', 'Bob'], // This would be a list of user IDs in a real application
  unavailableDates: [new Date(2023, 6, 10), new Date(2023, 6, 11), new Date(2023, 6, 12)] // Example unavailable dates
}

const relatedItems = [
  { id: 2, name: 'Camping Tent', price: 30, image: '/placeholder.svg?height=200&width=300', rating: 4.5, location: 'Denver, CO', priceType: 'day', features: ['Waterproof', '4-person'] },
  { id: 3, name: 'Surfboard', price: 35, image: '/placeholder.svg?height=200&width=300', rating: 4.8, location: 'Los Angeles, CA', priceType: 'day', features: ['Beginner-friendly', 'Includes leash'] },
  { id: 4, name: 'Kayak', price: 40, image: '/placeholder.svg?height=200&width=300', rating: 4.6, location: 'Portland, OR', priceType: 'day', features: ['2-person', 'Includes paddles'] },
]

export default function ItemListing() {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' })
  const [selectedImage, setSelectedImage] = useState(item.images[0])
  const [showReportDialog, setShowReportDialog] = useState(false)
  const params = useParams()
  const currentUser = { username: 'Alice' }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the review to your backend
    console.log('New review:', newReview)
    setShowReviewForm(false)
    setNewReview({ rating: 0, comment: '' })
  }

  const canReview = item.renters.includes(currentUser.username)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image src={selectedImage} alt={item.name} fill className="object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {item.images.map((image, index) => (
              <div
                key={index}
                className={`relative h-24 rounded-lg overflow-hidden cursor-pointer ${
                  selectedImage === image ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedImage(image)}
              >
                <Image src={image} alt={`${item.name} - Image ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{item.name}</h1>
            <HeartButton itemId={item.id} />
          </div>
          <div className="flex items-center mb-4">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <span className="ml-1 font-semibold">{item.rating.toFixed(1)}</span>
            <span className="ml-2 text-gray-600">({item.reviews.length} reviews)</span>
          </div>
          <div className="flex items-center mb-4 text-2xl font-bold text-green-600">
            <DollarSign className="h-6 w-6 mr-1" />
            {item.price}
            <span className="text-base font-normal text-gray-600 ml-1">/ day</span>
          </div>
          <div className="flex items-center mb-6 text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{item.location}</span>
          </div>
          <p className="text-gray-700 mb-6">{item.description}</p>
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Features:</h3>
              <div className="flex flex-wrap gap-2">
                {item.features.map((feature, index) => (
                  <Badge key={index} variant="secondary">{feature}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Policies:</h3>
              <ul className="list-disc list-inside">
                {item.policies.map((policy, index) => (
                  <li key={index}>{policy}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex space-x-4">
            <RentalRequest 
              itemId={item.id} 
              itemName={item.name} 
              pricePerDay={item.price}
              unavailableDates={item.unavailableDates}
            />
            <Button>
              <MessageCircle className="mr-2 h-4 w-4" /> Chat with Owner
            </Button>
            <Button variant="outline" onClick={() => setShowReportDialog(true)}>
              <Flag className="mr-2 h-4 w-4" /> Report Listing
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About the Owner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Image src={item.owner.avatar} alt={item.owner.name} width={64} height={64} className="rounded-full" />
            <div className="ml-4">
              <Link href={`/profile/${item.owner.id}`} className="text-xl font-semibold hover:underline">
                {item.owner.name}
              </Link>
              <div className="flex items-center mt-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 font-semibold">{item.owner.rating.toFixed(1)}</span>
                <span className="ml-2 text-gray-600">({item.owner.totalRentals} rentals)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {item.reviews.map((review) => (
                <UserReview
                  key={review.id}
                  username={review.username}
                  avatar={review.avatar}
                  rating={review.rating}
                  date={review.date}
                  comment={review.comment}
                />
              ))}
            </div>
          </ScrollArea>
          {canReview && !showReviewForm && (
            <Button onClick={() => setShowReviewForm(true)} className="mt-4">
              Write a Review
            </Button>
          )}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
              <div>
                <label className="block mb-2">Rating</label>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 cursor-pointer ${i < newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="comment" className="block mb-2">Comment</label>
                <Textarea
                  id="comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={4}
                />
              </div>
              <Button type="submit">Submit Review</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemGrid items={relatedItems} />
        </CardContent>
      </Card>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reportType="listing"
        reportedItemId={item.id}
        reportedItemName={item.name}
      />
    </div>
  )
}

