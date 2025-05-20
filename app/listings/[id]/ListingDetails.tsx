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
  User,
  Truck,
  Eye,
  CheckCircle,
  BadgeCheck
} from 'lucide-react'
import { ReportDialog } from '@/components/ReportDialog'
import { FavoriteButton } from '../../components/ui/favorite-button'
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarCheck, Map, Zap, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    category: string
    availableFrom: string
    availableTo: string
    securityDeposit?: number
    minRentalDays?: number
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
  const [expanded, setExpanded] = useState(false)

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  // Helper function to safely format dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Ikke angitt';
      }
      return date.toLocaleDateString('nb-NO');
    } catch (error) {
      return 'Ikke angitt';
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main content */}
      <div className="space-y-8">
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
                {hasRating ? `${rating.toFixed(1)} (${item.review_count})` : 'Ingen anmeldelser ennå'}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center">
              <div className="bg-blue-50 p-1.5 rounded-md">
                <MapPin className="h-5 w-5 text-blue-500" />
              </div>
              <span className="ml-2 text-gray-700">
                {item.location || 'Plassering ikke spesifisert'}
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

          {/* Price Display - Visible on all screens */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Daglig leiepris</p>
            <div className="flex items-center text-2xl font-bold text-[#4CD964]">
              {item.price} kr
              <span className="text-base font-normal text-gray-600 ml-1">/ dag</span>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="bg-blue-50 p-1.5 rounded-md mr-3">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Rask responstid</p>
                <p className="text-sm text-gray-500">Svarer vanligvis innen en time</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="bg-green-50 p-1.5 rounded-md mr-3">
                <Calendar className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Tilgjengelig nå</p>
                <p className="text-sm text-gray-500">Klar for utleie straks</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="bg-yellow-50 p-1.5 rounded-md mr-3">
                <Shield className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Trygge betalinger</p>
                <p className="text-sm text-gray-500">Sikker betalingsløsning</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="bg-purple-50 p-1.5 rounded-md mr-3">
                <BadgeCheck className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Verifisert bruker</p>
                <p className="text-sm text-gray-500">ID og kontaktinfo bekreftet</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8 relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Beskrivelse</h2>
            <div className={cn(
              "prose prose-gray text-gray-700 leading-relaxed whitespace-pre-line",
              !expanded ? "max-h-40 overflow-hidden" : ""
            )}>
              <p>{item.description}</p>
            </div>
            {!expanded && item.description && item.description.length > 150 && (
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
            )}
            {item.description && item.description.length > 150 && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleExpand}
                className="flex items-center text-gray-600 hover:text-gray-900 p-2 mt-2 h-auto font-medium"
              >
                {expanded ? (
                  <>Vis mindre <ChevronUp className="ml-1 h-4 w-4" /></>
                ) : (
                  <>Vis mer <ChevronDown className="ml-1 h-4 w-4" /></>
                )}
              </Button>
            )}
          </div>

          {/* Category and Availability Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold mb-3">Kategori</h3>
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-gray-400 mr-2" />
                <Badge variant="outline" className="bg-white">
                  {item.category}
                </Badge>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold mb-3">Tilgjengelighet</h3>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-700">Fra: {formatDate(item.availableFrom)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-700">Til: {formatDate(item.availableTo)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features/Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <Shield className="h-5 w-5 text-[#4CD964] mr-3" />
              <div>
                <p className="font-medium text-gray-900">Forsikring tilgjengelig</p>
                <p className="text-sm text-gray-500">Beskyttelse inkludert</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <Clock className="h-5 w-5 text-[#4CD964] mr-3" />
              <div>
                <p className="font-medium text-gray-900">Fleksibel henting</p>
                <p className="text-sm text-gray-500">Koordiner med eier</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <Calendar className="h-5 w-5 text-[#4CD964] mr-3" />
              <div>
                <p className="font-medium text-gray-900">Enkel booking</p>
                <p className="text-sm text-gray-500">Forespørsel med kalender</p>
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
                    <MessageCircle className="mr-2 h-4 w-4" /> Chat med eier
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  className="text-gray-700 hover:text-red-600"
                >
                  <Flag className="mr-2 h-4 w-4" /> Rapporter annonse
                </Button>
              </>
            ) : isLoggedIn && userIsOwner ? (
              <Button
                asChild
                className="bg-[#4CD964] hover:bg-[#3DAF50] text-white"
              >
                <Link href={`/listings/${item.id}/edit`}>
                  Rediger annonse
                </Link>
              </Button>
            ) : (
              <Button asChild className="bg-[#4CD964] hover:bg-[#3DAF50] text-white">
                <Link href="/sign-in">Logg inn for å leie eller kontakte eier</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Owner Card */}
        <Card className="overflow-hidden shadow-sm border-gray-100">
          <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-[#4CD964]" />
              Om eieren
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                {item.user_image ? (
                  <Image
                    src={item.user_image}
                    alt={item.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#4CD964]/10 text-[#4CD964]">
                    <User className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">{item.username}</h3>
                <p className="text-sm text-gray-500">Medlem siden 2023</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Policies summary - simplified version of what was in the tabs */}
        <Card className="overflow-hidden shadow-sm border-gray-100">
          <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-[#4CD964]" />
              Leiebetingelser
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                <span>
                  <span className="font-medium">Pris:</span> 
                  <span className="text-gray-700"> {item.price} kr / dag</span>
                </span>
              </div>
              
              {item.minRentalDays && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span>
                    <span className="font-medium">Minimum leietid:</span> 
                    <span className="text-gray-700"> {item.minRentalDays} dager</span>
                  </span>
                </div>
              )}
              
              {item.securityDeposit && (
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 mr-2" />
                  <span>
                    <span className="font-medium">Depositum:</span> 
                    <span className="text-gray-700"> {item.securityDeposit} kr (refunderes)</span>
                  </span>
                </div>
              )}
              
              <div className="flex items-start pt-4 border-t border-gray-100">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <span className="font-medium">Plassering: </span>
                  <span className="text-gray-700">{item.location || 'Plassering ikke spesifisert'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
} 