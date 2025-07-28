'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AvailabilityPeriod {
  start_date: string
  end_date: string
  status: 'booked' | 'pending' | 'maintenance'
  renter_name?: string
}

interface AvailabilityCalendarProps {
  listingId: string
  className?: string
  compact?: boolean
  bookedPeriods?: AvailabilityPeriod[]
  onDateSelect?: (dates: { start: Date; end: Date | null }) => void
}

const MONTHS = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
]

const WEEKDAYS = ['S', 'M', 'T', 'O', 'T', 'F', 'L']

export function AvailabilityCalendar({
  listingId,
  className,
  compact = false,
  bookedPeriods = [],
  onDateSelect
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedStart, setSelectedStart] = useState<Date | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Generate calendar days
  const calendarDays = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentYear, currentMonth, day))
  }

  const isDateBooked = (date: Date) => {
    return bookedPeriods.some(period => {
      const start = new Date(period.start_date)
      const end = new Date(period.end_date)
      return date >= start && date <= end
    })
  }

  const isDatePast = (date: Date) => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return dateOnly < todayOnly
  }

  const isDateInSelectedRange = (date: Date) => {
    if (!selectedStart) return false
    if (!selectedEnd && !hoveredDate) return date.getTime() === selectedStart.getTime()
    
    const endDate = selectedEnd || hoveredDate
    if (!endDate) return false
    
    const start = selectedStart < endDate ? selectedStart : endDate
    const end = selectedStart < endDate ? endDate : selectedStart
    
    return date >= start && date <= end
  }

  const handleDateClick = (date: Date) => {
    if (isDatePast(date) || isDateBooked(date)) return

    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Start new selection
      setSelectedStart(date)
      setSelectedEnd(null)
    } else {
      // Complete selection
      const start = selectedStart < date ? selectedStart : date
      const end = selectedStart < date ? date : selectedStart
      
      // Check if any dates in range are booked
      const hasBookedDates = bookedPeriods.some(period => {
        const bookedStart = new Date(period.start_date)
        const bookedEnd = new Date(period.end_date)
        return (bookedStart <= end && bookedEnd >= start)
      })
      
      if (hasBookedDates) {
        // Reset selection if range contains booked dates
        setSelectedStart(date)
        setSelectedEnd(null)
      } else {
        setSelectedEnd(end)
        onDateSelect?.({ start, end })
      }
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getDateStatus = (date: Date) => {
    if (isDatePast(date)) return 'past'
    if (isDateBooked(date)) return 'booked'
    if (isDateInSelectedRange(date)) return 'selected'
    return 'available'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'past':
        return 'text-gray-300'
      case 'booked':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'selected':
        return 'bg-emerald-500 text-white'
      case 'available':
        return 'hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer'
      default:
        return ''
    }
  }

  if (compact) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Tilgjengelighet
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-2">
            {/* Current availability status */}
            <div className="flex items-center justify-between text-sm">
              <span>Status:</span>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700">
                <Check className="h-3 w-3 mr-1" />
                Tilgjengelig nå
              </Badge>
            </div>
            
            {/* Next unavailable period */}
            {bookedPeriods.length > 0 && (
              <div className="text-xs text-gray-600">
                <span className="font-medium">Neste opptatte periode:</span>
                <br />
                {new Date(bookedPeriods[0].start_date).toLocaleDateString('no-NO')} - 
                {new Date(bookedPeriods[0].end_date).toLocaleDateString('no-NO')}
              </div>
            )}
            
            <Button variant="outline" size="sm" className="w-full text-xs">
              Se full kalender
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Tilgjengelighet
          </CardTitle>
        </div>
        
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="font-medium">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={index} className="p-2" />
            }
            
            const status = getDateStatus(date)
            const isDisabled = status === 'past' || status === 'booked'
            
            return (
              <button
                key={date.getTime()}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={isDisabled}
                className={cn(
                  "p-2 text-sm rounded-md border transition-colors",
                  "flex items-center justify-center min-h-[2.5rem]",
                  getStatusColor(status),
                  isDisabled && "cursor-not-allowed"
                )}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded mr-2" />
              <span>Tilgjengelig</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-2" />
              <span>Opptatt</span>
            </div>
          </div>
          
          {selectedStart && (
            <div className="text-xs bg-gray-50 p-2 rounded">
              <span className="font-medium">Valgt periode:</span>
              <br />
              {selectedStart.toLocaleDateString('no-NO')}
              {selectedEnd && ` - ${selectedEnd.toLocaleDateString('no-NO')}`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 