'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRange } from 'react-day-picker'

interface AvailabilityCalendarProps {
  listingId: string
  onDateSelect?: (dateRange: DateRange) => void
  className?: string
}

export function AvailabilityCalendar({ 
  listingId, 
  onDateSelect,
  className 
}: AvailabilityCalendarProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [totalPrice, setTotalPrice] = useState(0)
  const [pricePerDay, setPricePerDay] = useState(0)
  
  // Function to disable unavailable dates
  const disabledDays = [
    ...unavailableDates,
    { before: new Date() } // Can't select dates in the past
  ]
  
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true)
      
      try {
        // In a real app, fetch from API
        // For demo, simulate with random dates
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Get listing price for calculations
        const priceResponse = await fetch(`/api/listings/${listingId}`)
        if (priceResponse.ok) {
          const data = await priceResponse.json()
          setPricePerDay(data.price)
        }
        
        // Generate some random unavailable dates
        const today = new Date()
        const twoMonthsFromNow = new Date()
        twoMonthsFromNow.setMonth(today.getMonth() + 2)
        
        const unavailable: Date[] = []
        
        // Generate 5-10 random unavailable days in the next 60 days
        const numberOfUnavailableDays = Math.floor(Math.random() * 5) + 5
        
        for (let i = 0; i < numberOfUnavailableDays; i++) {
          const randomDayOffset = Math.floor(Math.random() * 60) + 1
          const unavailableDate = new Date()
          unavailableDate.setDate(today.getDate() + randomDayOffset)
          unavailable.push(unavailableDate)
        }
        
        setUnavailableDates(unavailable)
      } catch (error) {
        console.error('Error fetching availability:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAvailability()
  }, [listingId])
  
  // Calculate the rental duration and total price
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const startDate = new Date(dateRange.from)
      const endDate = new Date(dateRange.to)
      
      // Calculate the number of days
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // Include both start and end days
      
      // Calculate total price
      setTotalPrice(diffDays * pricePerDay)
      
      // Call the onDateSelect callback
      onDateSelect?.(dateRange)
    } else {
      setTotalPrice(0)
    }
  }, [dateRange, pricePerDay, onDateSelect])
  
  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader className="bg-[#4CD964]/10">
        <CardTitle className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-[#4CD964]" />
          Check Availability
        </CardTitle>
        <CardDescription>
          Select your rental dates
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-[#4CD964]" />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                disabled={disabledDays}
                numberOfMonths={1}
                className="rounded-md"
              />
            </div>
            
            {dateRange?.from && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Selected Dates:</span>
                  <span className="text-sm">
                    {dateRange.from && format(dateRange.from, 'PP')}
                    {dateRange.to && dateRange.to !== dateRange.from ? 
                      ` - ${format(dateRange.to, 'PP')}` : ''}
                  </span>
                </div>
                
                {totalPrice > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Price per day:</span>
                      <span className="text-sm">${pricePerDay.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total price:</span>
                      <span className="text-lg font-bold text-[#4CD964]">${totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <Button className="w-full mt-4 bg-[#4CD964] hover:bg-[#3DAF50]">
                      Request to Rent
                    </Button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
} 