import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Package, Star, Clock, Settings } from 'lucide-react'

interface ProfileTabsProps {
  children: {
    listings: React.ReactNode
    reviews: React.ReactNode
    activity: React.ReactNode
    settings: React.ReactNode
  }
  defaultTab?: string
  isOwnProfile?: boolean
}

export function ProfileTabs({ 
  children,
  defaultTab = "listings",
  isOwnProfile = false
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
        <TabsTrigger value="listings" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Listings</span>
        </TabsTrigger>
        <TabsTrigger value="reviews" className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          <span className="hidden sm:inline">Reviews</span>
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Activity</span>
        </TabsTrigger>
        {isOwnProfile && (
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="listings" className="space-y-6">
        {children.listings}
      </TabsContent>

      <TabsContent value="reviews" className="space-y-6">
        {children.reviews}
      </TabsContent>

      <TabsContent value="activity" className="space-y-6">
        {children.activity}
      </TabsContent>

      {isOwnProfile && (
        <TabsContent value="settings" className="space-y-6">
          {children.settings}
        </TabsContent>
      )}
    </Tabs>
  )
} 