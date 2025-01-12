'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, MessageCircle } from 'lucide-react'
import { ItemGrid } from '@/components/ItemGrid'
import { Wishlist } from '@/components/Wishlist'
import { ReportDialog } from '@/components/ReportDialog'
import { useUser } from "@clerk/nextjs"

interface UserProfile {
  id: string
  username: string
  image_url: string | null
  bio: string | null
  location: string | null
  joinDate: string
  totalListings: number
  totalRentals: number
  rating: number
}

interface UserListing {
  id: string
  name: string
  price: number
  image: string | null
  rating: number
  review_count: number
  location: string | null
}

export default function UserProfile() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('listings')
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<UserListing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const [profileResponse, listingsResponse] = await Promise.all([
          fetch(`/api/users/${params.username}`),
          fetch(`/api/users/${params.username}/listings`)
        ])

        if (profileResponse.ok && listingsResponse.ok) {
          const [profileData, listingsData] = await Promise.all([
            profileResponse.json(),
            listingsResponse.json()
          ])

          setProfile(profileData)
          setListings(listingsData)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.username) {
      fetchUserData()
    }
  }, [params.username])

  const handleMessageClick = () => {
    if (!profile) return
    router.push(`/chat?userId=${profile.id}`)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!profile) {
    return <div>User not found</div>
  }

  const isOwnProfile = user?.id === profile.id

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col md:flex-row items-center gap-6 py-6">
          <Avatar className="w-32 h-32">
            <AvatarImage 
              src={profile.image_url || '/placeholder.svg'} 
              alt={profile.username}
            />
            <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{profile.username}</h1>
            {profile.location && (
              <div className="flex items-center justify-center md:justify-start mt-2">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-500">{profile.location}</span>
              </div>
            )}
            <div className="flex items-center justify-center md:justify-start mt-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1 font-semibold">{profile.rating.toFixed(1)}</span>
              <span className="ml-2 text-gray-600">({profile.totalRentals} rentals)</span>
            </div>
            {profile.bio && (
              <p className="mt-4 text-gray-700">{profile.bio}</p>
            )}
            <div className="mt-4 flex justify-center md:justify-start space-x-4">
              {!isOwnProfile && (
                <Button onClick={handleMessageClick}>
                  <MessageCircle className="mr-2 h-4 w-4" /> Message
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowReportDialog(true)}>
                Report User
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="listings">Listings ({profile.totalListings})</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>{profile.username}'s Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {listings.length === 0 ? (
                <p className="text-center text-gray-500">No listings yet</p>
              ) : (
                <ItemGrid items={listings.map(listing => ({
                  id: listing.id,
                  name: listing.name,
                  price: Number(listing.price),
                  image: listing.image || '/placeholder.svg?height=200&width=300',
                  rating: Number(listing.rating),
                  location: listing.location || 'Location not specified',
                  priceType: 'day',
                  features: []
                }))} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="wishlist">
          <Wishlist />
        </TabsContent>
      </Tabs>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reportType="user"
        reportedItemId={profile.id}
        reportedItemName={profile.username}
      />
    </div>
  )
}

