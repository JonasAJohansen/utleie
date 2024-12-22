'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface RentalRequestsProps {
  itemName: string
}

export function RentalRequests({ itemName }: Omit<RentalRequestsProps, 'itemId'>) {
  const [requests, setRequests] = useState<RentalRequest[]>([
    { id: 1, username: 'Alice', startDate: '2023-07-01', endDate: '2023-07-03', status: 'pending' },
    { id: 2, username: 'Bob', startDate: '2023-07-15', endDate: '2023-07-17', status: 'pending' },
  ])

  const handleRequestAction = (requestId: number, action: 'approve' | 'reject') => {
    setRequests(requests.map(request =>
      request.id === requestId
        ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' }
        : request
    ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rental Requests for {itemName}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {requests.map(request => (
            <div key={request.id} className="mb-4 p-4 border rounded">
              <p><strong>User:</strong> {request.username}</p>
              <p><strong>Dates:</strong> {request.startDate} to {request.endDate}</p>
              <p><strong>Status:</strong> {request.status}</p>
              {request.status === 'pending' && (
                <div className="mt-2">
                  <Button
                    onClick={() => handleRequestAction(request.id, 'approve')}
                    className="mr-2"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleRequestAction(request.id, 'reject')}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

interface RentalRequest {
  id: number
  username: string
  startDate: string
  endDate: string
  status: 'pending' | 'approved' | 'rejected'
}

