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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
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
    if (selectedDate) {
      setTotalPrice(pricePerDay) // Single day rental
    } else {
      setTotalPrice(0)
    }
  }, [selectedDate, pricePerDay])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  const handleRequest = async () => {
    if (!selectedDate) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/rental-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: itemId,
          startDate: format(selectedDate, 'yyyy-MM-dd'),
          endDate: format(selectedDate, 'yyyy-MM-dd'), // Same date for single-day rental
          totalPrice
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      toast({
        title: "Forespørsel sendt!",
        description: "Eieren vil se på forespørselen din snart.",
      })
      setIsDialogOpen(false)
      setSelectedDate(undefined)
    } catch (error) {
      toast({
        title: "Feil",
        description: error instanceof Error ? error.message : "Kunne ikke sende forespørsel",
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
            Velg dato for leie. Prisen er {pricePerDay} kr per dag.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Velg dato</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
              disabled={(date) => date < new Date() || isDateUnavailable(date)}
            />
          </div>
          {selectedDate && (
            <div className="grid gap-2">
              <Label>Total pris</Label>
              <p className="text-2xl font-bold">{totalPrice} kr</p>
              <p className="text-sm text-gray-500">
                For {format(selectedDate, 'dd.MM.yyyy')}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleRequest} disabled={!selectedDate || isLoading}>
            {isLoading ? "Sender..." : "Send forespørsel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

