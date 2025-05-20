'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, isAfter, isBefore, isEqual } from 'date-fns';
import { cn } from '@/lib/utils';

// Import custom styles
import './calendar-styles.css';

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

  const handleDateChange = (dates: [Date | null, Date | null] | null) => {
    if (!dates) {
      setStartDate(null);
      setEndDate(null);
      onDateChange(null, null);
      return;
    }

    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    onDateChange(start, end);
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
      'bg-[#4CD964] text-white': isStart || isEnd,
      'bg-[#E7F9EF]': isRangeDate && !isStart && !isEnd,
      'bg-red-100 text-red-800 line-through cursor-not-allowed': isUnavailable,
    };
  };

  return (
    <div className="w-full">
      <div className="w-full border border-gray-200">
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
          dayClassName={date => cn(highlightDates(date))}
          renderCustomHeader={({
            date,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <Button
                variant="ghost"
                size="icon"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className={cn(
                  "text-gray-600",
                  prevMonthButtonDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-medium text-gray-900">
                {format(date, 'MMMM yyyy')}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className={cn(
                  "text-gray-600",
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
      
      {startDate && endDate && (
        <div className="flex justify-between mt-3 text-sm text-gray-700">
          <div>
            <span className="font-medium">From:</span>{' '}
            {format(startDate, 'MMM dd, yyyy')}
          </div>
          <div>
            <span className="font-medium">To:</span>{' '}
            {format(endDate, 'MMM dd, yyyy')}
          </div>
        </div>
      )}
    </div>
  );
} 