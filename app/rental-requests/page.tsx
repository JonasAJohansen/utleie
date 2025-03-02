'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@clerk/nextjs"
import { format, isPast, isToday } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle, Clock, XCircle, CalendarClock, MessageCircle, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface RentalRequest {
  id: string;
  listing_id: string;
  listing_name: string;
  listing_image: string | null;
  listing_price: number;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'canceled';
  message: string;
  created_at: string;
  updated_at: string;
  requester_id?: string;
  requester_username?: string;
  requester_image?: string;
  owner_username?: string;
  owner_image?: string;
  request_type?: 'incoming' | 'outgoing';
  other_username?: string;
  other_image?: string;
}

export default function RentalRequestsPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RentalRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionItemId, setActionItemId] = useState<string | null>(null);

  // Load requests based on active tab
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/rental-requests?type=${activeTab}&status=${statusFilter}`);
        if (!response.ok) {
          throw new Error("Failed to fetch rental requests");
        }
        const data = await response.json();
        setRequests(data.requests || []);
      } catch (error) {
        console.error("Error fetching rental requests:", error);
        toast({
          title: "Error",
          description: "Failed to load rental requests. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isSignedIn) {
      fetchRequests();
    }
  }, [activeTab, statusFilter, isSignedIn, toast]);

  // Apply filters
  useEffect(() => {
    setFilteredRequests(requests);
  }, [requests]);

  // Handle request approval
  const handleApproveRequest = async (requestId: string) => {
    setIsActionLoading(true);
    setActionItemId(requestId);
    try {
      const response = await fetch(`/api/rental-requests/${requestId}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve request");
      }

      toast({
        title: "Request Approved",
        description: "The rental request has been approved successfully.",
      });

      // Update the local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "approved" } : req
        )
      );
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve request",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
      setActionItemId(null);
    }
  };

  // Handle request rejection
  const handleRejectRequest = async (requestId: string, reason?: string) => {
    setIsActionLoading(true);
    setActionItemId(requestId);
    try {
      const response = await fetch(`/api/rental-requests/${requestId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reject request");
      }

      toast({
        title: "Request Rejected",
        description: "The rental request has been rejected.",
      });

      // Update the local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "rejected" } : req
        )
      );
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
      setActionItemId(null);
    }
  };

  // Handle request cancellation
  const handleCancelRequest = async (requestId: string, reason?: string) => {
    setIsActionLoading(true);
    setActionItemId(requestId);
    try {
      const response = await fetch(`/api/rental-requests/${requestId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel request");
      }

      toast({
        title: "Request Canceled",
        description: "The rental request has been canceled.",
      });

      // Update the local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "canceled" } : req
        )
      );
    } catch (error) {
      console.error("Error canceling request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel request",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
      setActionItemId(null);
    }
  };

  if (!isLoaded) {
    return <div className="container py-20">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="container py-20">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="mb-6 text-gray-600">Please sign in to view your rental requests.</p>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Get status badge based on request status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case "canceled":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Render an individual request card
  const renderRequestCard = (request: RentalRequest) => {
    const isIncoming = activeTab === "incoming" || (activeTab === "all" && request.request_type === "incoming");
    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);
    const isPastRental = isPast(endDate) && !isToday(endDate);
    const isOngoing = isPast(startDate) && !isPast(endDate);
    
    // Calculate rental duration days
    const durationMs = new Date(request.end_date).getTime() - new Date(request.start_date).getTime();
    const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    
    // Calculate total price
    const totalPrice = days * request.listing_price;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="col-span-1"
      >
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  <Link href={`/listings/${request.listing_id}`} className="hover:text-primary hover:underline">
                    {request.listing_name}
                  </Link>
                </CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <CalendarClock className="h-3.5 w-3.5 mr-1" />
                  {format(new Date(request.start_date), "MMM d, yyyy")} - {format(new Date(request.end_date), "MMM d, yyyy")}
                </CardDescription>
              </div>
              {getStatusBadge(request.status)}
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-5">
            <div className="flex flex-col h-full">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4">
                {/* Listing image */}
                <div className="sm:col-span-2">
                  <div className="relative aspect-[4/3] rounded-md overflow-hidden">
                    <Link href={`/listings/${request.listing_id}`}>
                      <Image
                        src={request.listing_image || '/placeholder.svg'}
                        alt={request.listing_name}
                        fill
                        className="object-cover"
                      />
                    </Link>
                  </div>
                </div>
                
                {/* Request details */}
                <div className="sm:col-span-3 flex flex-col justify-between">
                  {/* User who requested or owner */}
                  <div className="flex items-center mb-3">
                    <div className="relative h-8 w-8 mr-2">
                      <Image
                        src={isIncoming ? (request.requester_image || '/placeholder.svg') : (request.owner_image || '/placeholder.svg')}
                        alt={isIncoming ? (request.requester_username || '') : (request.owner_username || '')}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <span className="text-sm">
                      {isIncoming 
                        ? `Requested by ${request.requester_username}` 
                        : `Owner: ${request.owner_username}`}
                    </span>
                  </div>
                  
                  {/* Price summary */}
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Price per day:</span>
                      <span>${Number(request.listing_price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{days} {days === 1 ? 'day' : 'days'}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-1 mt-1">
                      <span>Total:</span>
                      <span>${(Number(request.listing_price) * days).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Message/Note if present */}
              {request.message && (
                <div className="mt-2 mb-4 bg-gray-50 p-3 rounded-md text-sm">
                  <p className="font-medium text-gray-700 mb-1">Message:</p>
                  <p className="text-gray-600">{request.message}</p>
                </div>
              )}
              
              {/* Action buttons based on request status and type */}
              <div className="mt-auto">
                {request.status === 'pending' && isIncoming && (
                  <div className="flex space-x-2">
                    <Button 
                      className="w-1/2 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveRequest(request.id)}
                      disabled={isActionLoading && actionItemId === request.id}
                    >
                      {isActionLoading && actionItemId === request.id ? (
                        <span className="animate-spin mr-2">●</span>
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-1/2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={isActionLoading && actionItemId === request.id}
                    >
                      {isActionLoading && actionItemId === request.id ? (
                        <span className="animate-spin mr-2">●</span>
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Reject
                    </Button>
                  </div>
                )}
                
                {request.status === 'pending' && !isIncoming && (
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                    onClick={() => handleCancelRequest(request.id)}
                    disabled={isActionLoading && actionItemId === request.id}
                  >
                    {isActionLoading && actionItemId === request.id ? (
                      <span className="animate-spin mr-2">●</span>
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Cancel Request
                  </Button>
                )}
                
                {request.status === 'approved' && !isPastRental && (
                  <div className="space-y-2">
                    <Button 
                      asChild
                      className="w-full bg-primary"
                    >
                      <Link href={`/chat?userId=${isIncoming ? request.requester_id : request.listing_id.split('-')[0]}`}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message {isIncoming ? 'Renter' : 'Owner'}
                      </Link>
                    </Button>
                    
                    {!isOngoing && (
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCancelRequest(request.id)}
                        disabled={isActionLoading && actionItemId === request.id}
                      >
                        {isActionLoading && actionItemId === request.id ? (
                          <span className="animate-spin mr-2">●</span>
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                )}
                
                {(request.status === 'rejected' || request.status === 'canceled' || isPastRental) && (
                  <div className="flex space-x-2">
                    <Button 
                      asChild
                      variant="outline" 
                      className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      <Link href={`/listings/${request.listing_id}`}>
                        View Listing
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Render skeleton loader during loading state
  const renderSkeletons = () => {
    return Array(6)
      .fill(0)
      .map((_, index) => (
        <div key={index} className="col-span-1">
          <div className="border rounded-lg p-4 h-full">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-5 gap-4 py-2">
                <Skeleton className="h-32 col-span-2" />
                <div className="col-span-3 space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      ));
  };

  return (
    <div className="container py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Rental Requests</h1>
        <p className="text-gray-500 max-w-2xl">
          Manage all your rental requests, see the status of your requests, and respond to requests from others.
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <TabsList className="mb-2 sm:mb-0">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="incoming">Incoming</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <select
              className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderSkeletons()}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Rental Requests</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                You don't have any rental requests yet. Browse listings to find items to rent or list your own items.
              </p>
              <Button asChild className="mt-4">
                <Link href="/listings">Browse Listings</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredRequests.map((request) => (
                  <motion.div key={request.id} layout>
                    {renderRequestCard(request)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="incoming" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderSkeletons()}
            </div>
          ) : filteredRequests.filter(r => r.request_type === 'incoming' || activeTab !== 'all').length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Incoming Requests</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                You don't have any incoming rental requests. List your own items to start receiving rental requests.
              </p>
              <Button asChild className="mt-4">
                <Link href="/listings/new">List an Item</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredRequests
                  .filter(r => r.request_type === 'incoming' || activeTab !== 'all')
                  .map((request) => (
                    <motion.div key={request.id} layout>
                      {renderRequestCard(request)}
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderSkeletons()}
            </div>
          ) : filteredRequests.filter(r => r.request_type === 'outgoing' || activeTab !== 'all').length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Outgoing Requests</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                You haven't sent any rental requests yet. Browse listings to find items to rent.
              </p>
              <Button asChild className="mt-4">
                <Link href="/listings">Browse Listings</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredRequests
                  .filter(r => r.request_type === 'outgoing' || activeTab !== 'all')
                  .map((request) => (
                    <motion.div key={request.id} layout>
                      {renderRequestCard(request)}
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 