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

interface RentalRequestProps {
  itemId: number
  itemName: string
  pricePerDay: number
  unavailableDates: Date[]
}

export function RentalRequest({ itemId, itemName, pricePerDay, unavailableDates }: RentalRequestProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)

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

  const handleRequest = () => {
    if (selectedRange?.from && selectedRange?.to) {
      console.log('Rental request sent:', { 
        itemId, 
        itemName, 
        startDate: selectedRange.from, 
        endDate: selectedRange.to,
        totalPrice
      })
      setIsDialogOpen(false)
    }
  }

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(unavailableDate => 
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
              booked: unavailableDates
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
            disabled={!selectedRange?.from || !selectedRange?.to}
            className="w-full"
          >
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

