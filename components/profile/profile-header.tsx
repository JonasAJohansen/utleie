import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Settings, MessageSquare, Share2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { UserStats } from './user-stats'

interface ProfileHeaderProps {
  user: {
    id: string
    imageUrl: string
    fullName?: string | null
    username?: string | null
    primaryEmailAddress?: { emailAddress: string } | null
  }
  stats: {
    totalListings: number
    averageRating: number
    responseRate: number
    activeRentals: number
    totalRentals: number
    reviewCount: number
  }
  onImageUpload: (file: File) => Promise<void>
  isOwnProfile?: boolean
  isLoading?: boolean
}

export function ProfileHeader({ 
  user, 
  stats, 
  onImageUpload,
  isOwnProfile = false,
  isLoading = false
}: ProfileHeaderProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

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
      await onImageUpload(file)
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
        {/* Profile Photo */}
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-background">
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback className="text-2xl">
              {user.fullName?.[0] ?? user.username?.[0]}
            </AvatarFallback>
          </Avatar>
          {isOwnProfile && (
            <label 
              htmlFor="photo-upload" 
              className={`absolute bottom-2 right-2 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold mb-1">
            {user.fullName || user.username}
          </h1>
          {user.username && user.fullName && (
            <p className="text-muted-foreground mb-4">@{user.username}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
            {isOwnProfile ? (
              <>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
              </>
            ) : (
              <>
                <Button className="bg-[#4CD964] hover:bg-[#3DAF50]" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Stats */}
      <UserStats stats={stats} isLoading={isLoading} />
    </div>
  )
} 