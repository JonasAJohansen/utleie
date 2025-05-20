'use client'

import { useUser } from "@clerk/nextjs"
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { SettingsForm } from '@/components/profile/settings-form'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface ListingPhoto {
  url: string;
}

interface Listing {
  id: string;
  name: string;
  price: number;
  photos?: ListingPhoto[];
}

// Define the UserStats interface
interface UserStats {
  totalListings: number
  averageRating: number
  responseRate: number
  activeRentals: number
  totalRentals: number
  reviewCount: number
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [stats, setStats] = useState<UserStats>({
    totalListings: 0,
    averageRating: 0,
    responseRate: 0,
    activeRentals: 0,
    totalRentals: 0,
    reviewCount: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserListings()
      fetchUserStats()
    }
  }, [user])

  const fetchUserListings = async () => {
    try {
      setIsLoadingListings(true)
      const response = await fetch(`/api/listings?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setListings(data)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setIsLoadingListings(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await fetch('/api/profile/stats')
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalListings: data.listings.total,
          averageRating: parseFloat(data.reviews.avgRating) || 0,
          responseRate: data.responseRate,
          activeRentals: data.rentals.current,
          totalRentals: data.rentals.completedAsOwner + data.rentals.completedAsRenter,
          reviewCount: data.reviews.count
        })
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  if (!isLoaded || !user) return null

  const handleImageUpload = async (file: File) => {
    try {
      setIsUpdating(true)
      // Update Clerk profile image
      await user?.setProfileImage({ file })
      // Wait for Clerk to update
      await user?.reload()
      
      // Get the new image URL from Clerk
      const newImageUrl = user?.imageUrl

      // Update the image URL in our database
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: newImageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile image')
      }

      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      })

      // Force a reload of the page to update all components
      window.location.reload()
    } catch (error) {
      throw error
    }
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      <ProfileHeader
        user={user}
        stats={stats}
        onImageUpload={handleImageUpload}
        isOwnProfile={true}
        isLoading={isLoadingStats}
      />

      <ProfileTabs defaultTab="listings" isOwnProfile={true}>
        {{
          listings: (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingListings ? (
                    <p>Loading your listings...</p>
                  ) : listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {listings.map((listing) => (
                        <div key={listing.id} className="bg-white rounded-lg shadow overflow-hidden">
                          <Link href={`/listings/${listing.id}`} className="block">
                            <div className="h-40 bg-gray-200 relative">
                              {listing.photos && listing.photos[0] && (
                                <img 
                                  src={listing.photos[0].url} 
                                  alt={listing.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium">{listing.name}</h3>
                              <p className="text-[#4CD964] font-bold">{listing.price} kr / dag</p>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className="text-muted-foreground">
                        You haven't created any listings yet.
                      </p>
                      <Button className="mt-4" asChild>
                        <Link href="/listings/new">Create Your First Listing</Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          ),
          reviews: (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No reviews yet.
                  </p>
                </CardContent>
              </Card>
            </div>
          ),
          activity: (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No recent activity.
                  </p>
                </CardContent>
              </Card>
            </div>
          ),
          settings: (
            <SettingsForm user={user} />
          ),
        }}
      </ProfileTabs>
    </div>
  )
}

