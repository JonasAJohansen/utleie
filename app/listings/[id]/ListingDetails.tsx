'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Star, 
  MessageCircle, 
  MapPin, 
  DollarSign, 
  Flag, 
  Calendar, 
  Shield, 
  Clock,
  CheckCircle2,
  User
} from 'lucide-react'
import { ReportDialog } from '@/components/ReportDialog'
import { FavoriteButton } from '../../components/ui/favorite-button'
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { RentalRequestForm } from '@/components/rental/RentalRequestForm'
import { StickySidebar } from '@/components/rental/StickySidebar'

interface ListingDetailsProps {
  item: {
    id: string
    name: string
    description: string
    price: number
    rating: number
    review_count: number
    location: string | null
    user_id: string
    username: string
    user_image: string | null
    condition?: string
  }
  userId: string | null
  isFavorited?: boolean
}

const conditionLabels: Record<string, string> = {
  'helt_ny': 'Helt ny',
  'som_ny': 'Som ny',
  'pent_brukt': 'Pent brukt',
  'godt_brukt': 'Godt brukt'
}

const conditionColors: Record<string, string> = {
  'helt_ny': 'bg-green-100 text-green-800',
  'som_ny': 'bg-blue-100 text-blue-800',
  'pent_brukt': 'bg-yellow-100 text-yellow-800',
  'godt_brukt': 'bg-orange-100 text-orange-800'
}

export function ListingDetails({ item, userId, isFavorited = false }: ListingDetailsProps) {
  const rating = parseFloat(item.rating.toString())
  const hasRating = !isNaN(rating) && item.review_count > 0
  const isLoggedIn = !!userId
  const userIsOwner = userId === item.user_id

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main content - 2/3 width on desktop */}
      <div className="md:col-span-2 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <motion.h1 
              className="text-3xl font-extrabold text-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {item.name}
            </motion.h1>
            {isLoggedIn && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <FavoriteButton
                  listingId={item.id}
                  initialIsFavorited={isFavorited}
                />
              </motion.div>
            )}
          </div>

          {/* Key Info Bar */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            {/* Rating */}
            <div className="flex items-center">
              <div className="bg-yellow-50 p-1.5 rounded-md">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
              </div>
              <span className="ml-2 font-medium text-gray-800">
                {hasRating ? `${rating.toFixed(1)} (${item.review_count})` : 'No reviews yet'}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center">
              <div className="bg-blue-50 p-1.5 rounded-md">
                <MapPin className="h-5 w-5 text-blue-500" />
              </div>
              <span className="ml-2 text-gray-700">
                {item.location || 'Location not specified'}
              </span>
            </div>

            {/* Condition (if available) */}
            {item.condition && (
              <div className="flex items-center">
                <Badge className={conditionColors[item.condition] || 'bg-gray-100 text-gray-800'}>
                  {conditionLabels[item.condition] || item.condition}
                </Badge>
              </div>
            )}
          </div>

          {/* Price info - Mobile only */}
          <div className="md:hidden mb-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div>
              <p className="text-sm text-gray-500 mb-1">Daily Rental Price</p>
              <div className="flex items-center text-2xl font-bold text-[#4CD964]">
                <DollarSign className="h-5 w-5 mr-1" />
                {item.price}
                <span className="text-base font-normal text-gray-600 ml-1">/ day</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>
          </div>

          {/* Features/Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <Shield className="h-5 w-5 text-[#4CD964] mr-3" />
              <div>
                <p className="font-medium text-gray-900">Insurance Available</p>
                <p className="text-sm text-gray-500">Protection included</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <Clock className="h-5 w-5 text-[#4CD964] mr-3" />
              <div>
                <p className="font-medium text-gray-900">Flexible Pickup</p>
                <p className="text-sm text-gray-500">Coordinate with owner</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <Calendar className="h-5 w-5 text-[#4CD964] mr-3" />
              <div>
                <p className="font-medium text-gray-900">Easy Booking</p>
                <p className="text-sm text-gray-500">Request with calendar</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {isLoggedIn && !userIsOwner ? (
              <>
                <Button 
                  asChild
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800"
                >
                  <Link href={`/chat?userId=${item.user_id}&listingId=${item.id}&listingName=${encodeURIComponent(item.name)}`}>
                    <MessageCircle className="mr-2 h-4 w-4" /> Chat with Owner
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  className="text-gray-700 hover:text-red-600"
                >
                  <Flag className="mr-2 h-4 w-4" /> Report Listing
                </Button>
              </>
            ) : isLoggedIn && userIsOwner ? (
              <Button
                asChild
                className="bg-[#4CD964] hover:bg-[#3DAF50] text-white"
              >
                <Link href={`/listings/${item.id}/edit`}>
                  Edit Listing
                </Link>
              </Button>
            ) : (
              <Button asChild className="bg-[#4CD964] hover:bg-[#3DAF50] text-white">
                <Link href="/sign-in">Sign in to rent or contact owner</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Owner Card */}
        <Card className="overflow-hidden shadow-sm border-gray-100">
          <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-[#4CD964]" />
              About the Owner
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="relative">
                <Image 
                  src={item.user_image || '/placeholder.svg'} 
                  alt={item.username} 
                  width={72} 
                  height={72} 
                  className="rounded-full object-cover aspect-square border-2 border-white shadow-sm"
                />
                {/* Verified badge position */}
                <div className="absolute -bottom-1 -right-1 bg-[#4CD964] text-white p-1 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <Link href={`/profile/${item.user_id}`} className="text-xl font-semibold hover:underline text-gray-900">
                  {item.username}
                </Link>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">4.9 · Member since 2023</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Usually responds within 1 hour</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rental Policy Card */}
        <Card className="overflow-hidden shadow-sm border-gray-100">
          <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-[#4CD964]" />
              Rental Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Pickup & Return</h3>
                <p className="text-gray-600 text-sm">
                  Coordinate with the owner for pickup and return times. Please be punctual.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Damage Policy</h3>
                <p className="text-gray-600 text-sm">
                  Renters are responsible for any damage beyond normal wear and tear.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Cancellation</h3>
                <p className="text-gray-600 text-sm">
                  Free cancellation up to 48 hours before pickup. After that, a 50% fee applies.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Late Returns</h3>
                <p className="text-gray-600 text-sm">
                  Late returns are charged at 150% of the daily rate for each additional day.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sidebar - 1/3 width on desktop */}
      <div className="md:col-span-1">
        <StickySidebar offsetTop={100}>
          {/* Price card (desktop only) */}
          <div className="hidden md:block mb-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div>
              <p className="text-sm text-gray-500 mb-1">Daily Rental Price</p>
              <div className="flex items-center text-3xl font-bold text-[#4CD964]">
                <DollarSign className="h-6 w-6 mr-1" />
                {item.price}
                <span className="text-base font-normal text-gray-600 ml-1">/ day</span>
              </div>
            </div>
          </div>
          
          {/* Rental Request Form */}
          <RentalRequestForm
            listingId={item.id}
            listingName={item.name}
            pricePerDay={item.price}
            userIsOwner={userIsOwner}
          />
        </StickySidebar>
      </div>
    </motion.div>
  )
} 