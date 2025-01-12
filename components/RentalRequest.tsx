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
import { CalendarDays } from "lucide-react"

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
    if (selectedRange?.from) {
      // If only start date is selected, use it for both start and end
      const endDate = selectedRange.to || selectedRange.from
      const days = differenceInDays(endDate, selectedRange.from) + 1
      setTotalPrice(days * pricePerDay)
    } else {
      setTotalPrice(0)
    }
  }, [selectedRange, pricePerDay])

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from && !range.to) {
      // When only start date is selected, allow it to be a single-day rental
      setSelectedRange({ from: range.from, to: range.from })
    } else {
      setSelectedRange(range)
    }
  }

  const handleRequest = async () => {
    if (!selectedRange?.from) return

    // Use the same date for both start and end if no end date is selected
    const endDate = selectedRange.to || selectedRange.from

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
          endDate: format(endDate, 'yyyy-MM-dd'),
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
        <Button variant="default" className="w-full">
          <CalendarDays className="mr-2 h-4 w-4" />
          Send Leieforespørsel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Leieforespørsel</DialogTitle>
          <DialogDescription>
            Velg datoer for leie. Prisen er {pricePerDay} kr per dag.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Velg dato(er)</Label>
            <Calendar
              mode="single"
              selected={selectedRange}
              onSelect={handleDateSelect}
              className="rounded-md border"
              disabled={(date) => date < new Date() || isDateUnavailable(date)}
            />
          </div>
          {selectedRange?.from && (
            <div className="grid gap-2">
              <Label>Total pris</Label>
              <div className="text-2xl font-bold">
                {totalPrice} kr
              </div>
              <p className="text-sm text-gray-500">
                For 1 dag
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleRequest} disabled={!selectedRange?.from || isLoading}>
            {isLoading ? "Sending..." : "Send Forespørsel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

