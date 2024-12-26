'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { useToast } from "../hooks/use-toast"
import Link from 'next/link'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RentalRequest {
  id: string
  listingId: string
  listingName: string
  listingImage: string
  ownerName?: string
  ownerImage?: string
  renterName?: string
  renterImage?: string
  startDate: string
  endDate: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  totalPrice: number
  type: 'incoming' | 'outgoing'
  ownerId: string
  renterId: string
}

interface RentalRequestsListProps {
  userId: string
}

export function RentalRequestsList({ userId }: RentalRequestsListProps) {
  const [requests, setRequests] = useState<RentalRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/rental-requests')
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      } else {
        throw new Error('Failed to fetch requests')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load rental requests",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/rental-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setRequests(requests.map(request => 
          request.id === requestId ? { ...request, status } : request
        ))
        toast({
          title: `Request ${status}`,
          description: `The rental request has been ${status}`,
        })
      } else {
        throw new Error('Failed to update request')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rental request",
        variant: "destructive",
      })
    }
  }

  const handleOpenChat = (request: RentalRequest) => {
    const otherUserId = request.type === 'incoming' ? request.renterId : request.ownerId
    router.push(`/chat/${otherUserId}`)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const incomingRequests = requests.filter(r => r.type === 'incoming')
  const outgoingRequests = requests.filter(r => r.type === 'outgoing')

  const renderRequestCard = (request: RentalRequest) => (
    <Card key={request.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={request.type === 'incoming' ? request.renterImage : request.ownerImage} />
              <AvatarFallback>
                {request.type === 'incoming' 
                  ? (request.renterName || 'U')?.[0]
                  : (request.ownerName || 'U')?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link 
                href={`/listings/${request.listingId}`}
                className="text-lg font-semibold hover:text-primary"
              >
                {request.listingName}
              </Link>
              <p className="text-sm text-gray-500">
                {request.type === 'incoming' 
                  ? `Request from ${request.renterName || 'Unknown User'}`
                  : `Listed by ${request.ownerName || 'Unknown User'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenChat(request)}
              title="Open Chat"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            {request.type === 'incoming' && request.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleRequest(request.id, 'rejected')}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleRequest(request.id, 'approved')}
                >
                  Approve
                </Button>
              </>
            )}
            {request.status === 'pending' && request.type === 'outgoing' && (
              <Badge>Pending</Badge>
            )}
            {request.status === 'approved' && (
              <Badge variant="secondary">Approved</Badge>
            )}
            {request.status === 'rejected' && (
              <Badge variant="destructive">Rejected</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Link href={`/listings/${request.listingId}`}>
              <div className="relative h-48 rounded-lg overflow-hidden">
                <Image
                  src={request.listingImage || '/placeholder.png'}
                  alt={request.listingName}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
          </div>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Rental Period</p>
              <p className="text-gray-600">
                {new Date(request.startDate).toLocaleDateString()} to{' '}
                {new Date(request.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="font-medium">Total Price</p>
              <p className="text-gray-600">${request.totalPrice}</p>
            </div>
            <div className="text-sm text-gray-500">
              Requested on {new Date(request.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="incoming" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="incoming" className="text-lg">
          Incoming Requests {incomingRequests.length > 0 && `(${incomingRequests.length})`}
        </TabsTrigger>
        <TabsTrigger value="outgoing" className="text-lg">
          Your Requests {outgoingRequests.length > 0 && `(${outgoingRequests.length})`}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="incoming">
        {incomingRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">No incoming rental requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {incomingRequests.map(request => renderRequestCard(request))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="outgoing">
        {outgoingRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">You haven't made any rental requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {outgoingRequests.map(request => renderRequestCard(request))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
} 