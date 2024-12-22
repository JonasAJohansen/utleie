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

interface RentalRequestProps {
  itemId: number
  itemName: string
  pricePerDay: number
  unavailableDates: Date[]
}

export function RentalRequest({ itemId, itemName, pricePerDay, unavailableDates }: RentalRequestProps) {
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    if (selectedDates && selectedDates.length === 2) {
      const days = differenceInDays(selectedDates[1], selectedDates[0]) + 1
      setTotalPrice(days * 25) // Fixed price of $25 per day
    } else {
      setTotalPrice(0)
    }
  }, [selectedDates])

  const handleDateSelect = (dates: Date[] | undefined) => {
    setSelectedDates(dates)
  }

  const handleRequest = () => {
    if (selectedDates && selectedDates.length === 2) {
      console.log('Rental request sent:', { 
        itemId, 
        itemName, 
        startDate: selectedDates[0], 
        endDate: selectedDates[1],
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
            selected={selectedDates}
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
          {selectedDates?.length === 1 && (
            <p className="text-center mt-4 text-muted-foreground">
              Select an end date to see total price
            </p>
          )}
          {selectedDates?.length === 2 && (
            <div className="text-center mt-4 space-y-1">
              <p>
                Selected dates: {format(selectedDates[0], 'PP')} to {format(selectedDates[1], 'PP')}
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
            disabled={!selectedDates || selectedDates.length !== 2}
            className="w-full"
          >
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

