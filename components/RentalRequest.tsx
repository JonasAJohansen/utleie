'use client'

import { useState, useEffect } from 'react'
import { differenceInDays, format, isSameDay } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DateRange } from "react-day-picker"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface RentalRequestProps {
  itemId: string
  itemName: string
  pricePerDay: number
  unavailableDates: Date[]
}

export function RentalRequest({ itemId, itemName, pricePerDay, unavailableDates = [] }: RentalRequestProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [bookedDates, setBookedDates] = useState<Date[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Fetch unavailable dates from approved rental requests
    const fetchBookedDates = async () => {
      try {
        const response = await fetch(`/api/rental-requests?listingId=${itemId}`)
        if (response.ok) {
          const data = await response.json()
          const dates: Date[] = []
          data.forEach((booking: { startDate: string, endDate: string }) => {
            const start = new Date(booking.startDate)
            const end = new Date(booking.endDate)
            const current = new Date(start)
            while (current <= end) {
              dates.push(new Date(current))
              current.setDate(current.getDate() + 1)
            }
          })
          setBookedDates(dates)
        }
      } catch (error) {
        console.error('Error fetching booked dates:', error)
      }
    }
    fetchBookedDates()
  }, [itemId])

  useEffect(() => {
    if (selectedRange?.from && selectedRange?.to) {
      const days = differenceInDays(selectedRange.to, selectedRange.from) + 1
      setTotalPrice(days * pricePerDay)
    } else {
      setTotalPrice(0)
    }
  }, [selectedRange, pricePerDay])

  const handleDateSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)
  }

  const handleRequest = async () => {
    if (!selectedRange?.from || !selectedRange?.to) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/rental-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: itemId,
          startDate: format(selectedRange.from, 'yyyy-MM-dd'),
          endDate: format(selectedRange.to, 'yyyy-MM-dd'),
          totalPrice
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      toast({
        title: "Request sent!",
        description: "The owner will review your request soon.",
      })
      setIsDialogOpen(false)
      setSelectedRange(undefined)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isDateUnavailable = (date: Date) => {
    return [...unavailableDates, ...bookedDates].some(unavailableDate => 
      isSameDay(unavailableDate, date)
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Check Availability</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="space-y-2">
          <DialogTitle>Request to Rent: {itemName}</DialogTitle>
          <DialogDescription>
            Select your rental dates. The owner will review your request.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label className="block text-center mb-4">
            Select Start and End Dates
          </Label>
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={handleDateSelect}
            numberOfMonths={1}
            disabled={(date) => 
              date < new Date() || isDateUnavailable(date)
            }
            modifiers={{
              booked: [...unavailableDates, ...bookedDates]
            }}
            modifiersStyles={{
              booked: { textDecoration: 'line-through', color: 'red' }
            }}
            className="mx-auto"
            styles={{
              month: { width: '100%' },
              caption: { marginBottom: '1rem' },
              head_cell: { width: '100%', textAlign: 'center' },
              cell: { width: '100%', textAlign: 'center' },
              nav_button_previous: { width: '2rem', height: '2rem' },
              nav_button_next: { width: '2rem', height: '2rem' },
              table: { width: '100%' }
            }}
          />
          {selectedRange?.from && !selectedRange.to && (
            <p className="text-center mt-4 text-muted-foreground">
              Select an end date to see total price
            </p>
          )}
          {selectedRange?.from && selectedRange.to && (
            <div className="text-center mt-4 space-y-1">
              <p>
                Selected dates: {format(selectedRange.from, 'PP')} to {format(selectedRange.to, 'PP')}
              </p>
              <p className="font-bold">
                Total Price: ${totalPrice}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            onClick={handleRequest} 
            disabled={!selectedRange?.from || !selectedRange?.to || isLoading}
            className="w-full"
          >
            {isLoading ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

