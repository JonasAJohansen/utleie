'use client'

import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, MessageCircle } from 'lucide-react'
import { ItemGrid } from '@/components/ItemGrid'
import { Wishlist } from '@/components/Wishlist'
import { ReportDialog } from '@/components/ReportDialog'

// This would typically come from a database or API
const userData = {
  username: 'johndoe',
  name: 'John Doe',
  avatar: '/placeholder.svg?height=200&width=200',
  location: 'New York, NY',
  bio: 'Avid traveler and outdoor enthusiast. Always looking for new adventures and gear to try out!',
  joinDate: '2022-03-15',
  rating: 4.8,
  totalRentals: 37,
}

const userListings = [
  { id: 1, name: 'Mountain Bike', price: 25, image: '/placeholder.svg?height=200&width=300', rating: 4.5, location: 'New York, NY', priceType: 'day', features: ['21-speed', 'Front suspension'] },
  { id: 2, name: 'Camping Tent', price: 30, image: '/placeholder.svg?height=200&width=300', rating: 4.2, location: 'New York, NY', priceType: 'day', features: ['4-person', 'Waterproof'] },
  { id: 3, name: 'Surfboard', price: 35, image: '/placeholder.svg?height=200&width=300', rating: 4.7, location: 'New York, NY', priceType: 'day', features: ['8 ft', 'Beginner-friendly'] },
]

export default function UserProfile() {
  const params = useParams()
  //const username = params.username as string
  const [activeTab, setActiveTab] = useState('listings')
  const [showReportDialog, setShowReportDialog] = useState(false)

  // In a real application, you would fetch the user data based on the username

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col md:flex-row items-center gap-6 py-6">
        <Avatar className="w-32 h-32">
          <AvatarImage src={userData.avatar} alt={userData.name} />
          <AvatarFallback>{userData.name[0]}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold">{userData.name}</h1>
          <p className="text-gray-500">@{params.username as string}</p>
          <div className="flex items-center justify-center md:justify-start mt-2">
            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-gray-500">{userData.location}</span>
          </div>
          <div className="flex items-center justify-center md:justify-start mt-2">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <span className="ml-1 font-semibold">{userData.rating.toFixed(1)}</span>
            <span className="ml-2 text-gray-600">({userData.totalRentals} rentals)</span>
          </div>
          <p className="mt-4 text-gray-700">{userData.bio.replace("'", "&apos;")}</p>
          <div className="mt-4 flex justify-center md:justify-start space-x-4">
            <Button>
              <MessageCircle className="mr-2 h-4 w-4" /> Message
            </Button>
            <Button variant="outline" onClick={() => setShowReportDialog(true)}>
              Report User
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="listings">Listings</TabsTrigger>
        <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
      </TabsList>
      <TabsContent value="listings">
        <Card>
          <CardHeader>
            <CardTitle>{userData.name}'s Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemGrid items={userListings} />
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
      reportedItemId={userData.username}
      reportedItemName={userData.name}
    />
  </div>
)
}

