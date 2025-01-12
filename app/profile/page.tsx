'use client'

import { useUser } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  if (!isLoaded || !user) return null

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const file = e.target.files[0]
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

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
      console.error('Error updating profile photo:', error)
      toast({
        title: "Error",
        description: "Failed to update profile photo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback>{user.firstName?.[0] ?? user.username?.[0]}</AvatarFallback>
              </Avatar>
              <label 
                htmlFor="photo-upload" 
                className={`absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  id="photo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdating}
                />
              </label>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{user.fullName || user.username}</h2>
              <p className="text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={user.username || ''}
                readOnly={!isEditing}
                className="max-w-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.primaryEmailAddress?.emailAddress || ''}
                readOnly
                className="max-w-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={user.fullName || ''}
                readOnly={!isEditing}
                className="max-w-md"
              />
            </div>
            <div className="pt-4">
              <Button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

