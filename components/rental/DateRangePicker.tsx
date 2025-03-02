'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, isAfter, isBefore, isEqual } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  unavailableDates?: Date[];
  minDays?: number;
  maxDays?: number;
}

export function DateRangePicker({
  onDateChange,
  unavailableDates = [],
  minDays = 1,
  maxDays = 30,
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Ensure unavailable dates are Date objects
  const unavailableDateObjects = unavailableDates.map(date => 
    date instanceof Date ? date : new Date(date)
  );

  const handleDateChange = (date: Date | null) => {
    if (!date) {
      setStartDate(null);
      setEndDate(null);
      onDateChange(null, null);
      return;
    }

    if (!startDate || (startDate && endDate)) {
      // Start new date range selection
      setStartDate(date);
      setEndDate(null);
      onDateChange(date, null);
    } else {
      // Complete date range selection
      if (isBefore(date, startDate)) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        setEndDate(date);
      }
      
      onDateChange(startDate, date);
    }
  };

  const isDateInRange = (date: Date) => {
    if (startDate && !endDate && hoverDate) {
      return (
        isAfter(date, startDate) && 
        isBefore(date, hoverDate)
      ) || isEqual(date, startDate);
    }
    
    return (
      startDate &&
      endDate &&
      (isAfter(date, startDate) && isBefore(date, endDate))
    );
  };

  const isDateUnavailable = (date: Date) => {
    // Check if the date is in the unavailable dates
    return unavailableDateObjects.some(unavailableDate => 
      date.getDate() === unavailableDate.getDate() &&
      date.getMonth() === unavailableDate.getMonth() &&
      date.getFullYear() === unavailableDate.getFullYear()
    );
  };

  const highlightDates = (date: Date) => {
    const isStart = startDate && 
      date.getDate() === startDate.getDate() &&
      date.getMonth() === startDate.getMonth() &&
      date.getFullYear() === startDate.getFullYear();

    const isEnd = endDate && 
      date.getDate() === endDate.getDate() &&
      date.getMonth() === endDate.getMonth() &&
      date.getFullYear() === endDate.getFullYear();

    const isRangeDate = isDateInRange(date);
    const isUnavailable = isDateUnavailable(date);

    return {
      'bg-[#4CD964] text-white rounded-full': isStart || isEnd,
      'bg-[#E7F9EF] text-gray-800': isRangeDate && !isStart && !isEnd,
      'bg-red-100 text-red-800 line-through cursor-not-allowed': isUnavailable,
    };
  };

  return (
    <div className="w-full space-y-2">
      <div className="w-full bg-white border rounded-lg shadow-sm">
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          startDate={startDate}
          endDate={endDate}
          monthsShown={1}
          minDate={new Date()}
          maxDate={addDays(new Date(), 365)}
          selectsRange
          inline
          calendarClassName="w-full"
          dayClassName={date => cn(
            "rounded-full hover:bg-gray-100 transition-colors",
            highlightDates(date)
          )}
          renderCustomHeader={({
            date,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="flex items-center justify-between px-2 py-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className={cn(
                  "text-gray-500 hover:text-gray-700",
                  prevMonthButtonDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-md font-medium text-gray-900">
                {format(date, 'MMMM yyyy')}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className={cn(
                  "text-gray-500 hover:text-gray-700",
                  nextMonthButtonDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
          onDayMouseEnter={date => {
            if (startDate && !endDate) {
              setHoverDate(date);
            }
          }}
          excludeDates={unavailableDateObjects}
        />
      </div>
      
      <div className="flex items-center space-x-4 pt-2">
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-full bg-[#4CD964]"></div>
          <span className="text-xs text-gray-500">Selected</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-full bg-[#E7F9EF]"></div>
          <span className="text-xs text-gray-500">In Range</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-full bg-red-100"></div>
          <span className="text-xs text-gray-500">Unavailable</span>
        </div>
      </div>
      
      <div className="flex justify-between pt-2 text-sm text-gray-600">
        {startDate && (
          <div>
            <span className="font-medium">From:</span>{' '}
            {format(startDate, 'MMM dd, yyyy')}
          </div>
        )}
        {endDate && (
          <div>
            <span className="font-medium">To:</span>{' '}
            {format(endDate, 'MMM dd, yyyy')}
          </div>
        )}
      </div>
    </div>
  );
} 