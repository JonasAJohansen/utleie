'use client';

import { useState } from 'react';
import { DateRangePicker } from './DateRangePicker';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { format, differenceInDays, addDays } from 'date-fns';
import { CalendarClock, DollarSign, Shield, Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface RentalRequestFormProps {
  listingId: string;
  listingName: string;
  pricePerDay: number;
  unavailableDates?: Date[];
  userIsOwner?: boolean;
}

export function RentalRequestForm({
  listingId,
  listingName,
  pricePerDay,
  unavailableDates = [],
  userIsOwner = false,
}: RentalRequestFormProps) {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Calculate rental duration and total price
  const rentalDays = startDate && endDate 
    ? Math.max(1, differenceInDays(endDate, startDate) + 1) 
    : 0;
  const totalPrice = rentalDays * pricePerDay;

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing dates",
        description: "Please select start and end dates for your rental request.",
        variant: "destructive",
      });
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: "Terms agreement required",
        description: "Please agree to the rental terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/rental-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          message,
        }),
      });

      if (!response.ok) {
        throw new Error((await response.json()).error || 'Failed to submit rental request');
      }

      // Show confirmation and reset form
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
      }, 5000);

      // Reset form
      setStartDate(null);
      setEndDate(null);
      setMessage('');
      setAgreeToTerms(false);

      toast({
        title: "Request sent!",
        description: "Your rental request has been sent to the owner.",
      });
    } catch (error) {
      console.error('Error submitting rental request:', error);
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (userIsOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Listing</CardTitle>
          <CardDescription>You cannot rent your own item.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            This is your listing. You can manage booking requests from the rental requests page.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <a href="/rental-requests">Manage Rental Requests</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Request Sent Successfully!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>The owner will review your request and respond shortly.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 border-b pb-4">
          <CardTitle className="flex items-center">
            <CalendarClock className="h-5 w-5 mr-2 text-[#4CD964]" />
            Request to Rent
          </CardTitle>
          <CardDescription>
            Select your rental dates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <DateRangePicker
            onDateChange={handleDateChange}
            unavailableDates={unavailableDates}
          />

          {startDate && endDate && (
            <div className="mt-4 p-4 bg-[#F2FFF8] rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Rental Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per day:</span>
                  <span className="font-medium">${pricePerDay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{rentalDays} {rentalDays === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2 mt-2">
                  <span>Total price:</span>
                  <span className="text-[#4CD964]">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <Label htmlFor="message" className="mb-2 block">Message to Owner (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Introduce yourself and explain how you plan to use this item..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-start space-x-2 mt-4">
            <Checkbox 
              id="terms" 
              checked={agreeToTerms}
              onCheckedChange={(checked) => {
                setAgreeToTerms(checked as boolean);
              }}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the rental terms and conditions
              </label>
              <p className="text-xs text-muted-foreground">
                You'll be responsible for any damage beyond normal wear and tear.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t px-6 py-4">
          <Button
            className="w-full bg-[#4CD964] hover:bg-[#3DAF50]"
            disabled={!startDate || !endDate || !agreeToTerms || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">●</span>
                Processing...
              </>
            ) : (
              <>Send Rental Request</>
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">How it works</h3>
            <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Submit a request for your desired dates</li>
              <li>The owner will review and approve or deny your request</li>
              <li>Once approved, you'll be able to coordinate pickup details</li>
              <li>Return the item on time in the condition you received it</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 