'use client'

import { useUser } from "@clerk/nextjs"
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { SettingsForm } from '@/components/profile/settings-form'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

// Temporary mock data - replace with real data from API
const mockStats = {
  totalListings: 12,
  averageRating: 4.8,
  responseRate: 98,
  activeRentals: 3,
  totalRentals: 45,
  reviewCount: 32,
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

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
        stats={mockStats}
        onImageUpload={handleImageUpload}
        isOwnProfile={true}
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
                  <p className="text-muted-foreground">
                    You haven't created any listings yet.
                  </p>
                  <Button className="mt-4">
                    Create Your First Listing
                  </Button>
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

