'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, isAfter, isBefore, differenceInDays } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Listing } from '@/types/listing';
import Link from 'next/link';
import { addDays } from 'date-fns';

interface RentalRequestFormProps {
  listingId: string;
  listingName: string;
  pricePerDay: number;
  userIsOwner: boolean;
}

const rentalRequestSchema = z.object({
  startDate: z.date({
    required_error: "Start dato er påkrevd.",
  }),
  endDate: z.date({
    required_error: "Slutt dato er påkrevd.",
  }),
  message: z.string().min(10, {
    message: "Meldingen må være minst 10 tegn.",
  }).max(500, {
    message: "Meldingen kan ikke være lengre enn 500 tegn.",
  }),
}).refine(
  (data) => isAfter(data.endDate, data.startDate),
  {
    message: "Slutt dato må være etter start dato.",
    path: ["endDate"],
  }
);

type RentalRequestFormValues = z.infer<typeof rentalRequestSchema>;

export function RentalRequestForm({ listingId, listingName, pricePerDay, userIsOwner }: RentalRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  // Default values for available dates - should be replaced with actual data from API
  const availableFrom = new Date();
  const availableTo = new Date();
  availableTo.setMonth(availableTo.getMonth() + 3);
  
  const form = useForm<RentalRequestFormValues>({
    resolver: zodResolver(rentalRequestSchema),
    defaultValues: {
      message: "",
    },
  });
  
  async function onSubmit(data: RentalRequestFormValues) {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/rental-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listingId,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
          message: data.message,
          totalPrice: totalPrice,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Noe gikk galt');
      }
      
      toast({
        title: "Forespørsel sendt!",
        description: "Utleier vil bli varslet om din forespørsel.",
      });
      
      router.push('/rental-requests');
      router.refresh();
      
    } catch (error) {
      console.error('Error submitting rental request:', error);
      toast({
        title: "Feil ved sending av forespørsel",
        description: error instanceof Error ? error.message : "Noe gikk galt. Prøv igjen senere.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');
  
  let totalDays = 0;
  let totalPrice = 0;
  
  if (startDate && endDate) {
    totalDays = differenceInDays(endDate, startDate) + 1;
    totalPrice = totalDays * pricePerDay;
  }
  
  const handleDateRangeChange = (value: [Date | undefined, Date | undefined]) => {
    if (value[0]) {
      form.setValue('startDate', value[0]);
    }
    if (value[1]) {
      form.setValue('endDate', value[1]);
    }
  };
  
  if (userIsOwner) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="font-semibold text-lg mb-4">Dette er din annonse</h2>
        <p className="text-gray-600 mb-4">Du kan ikke sende leieforespørsel på din egen annonse.</p>
        <Button 
          className="w-full bg-[#4CD964] hover:bg-[#3CB954] text-white"
          asChild
        >
          <Link href="/listings/new">Legg ut en annen gjenstand</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h2 className="font-semibold text-lg mb-4">Send leieforespørsel</h2>
      <p className="text-gray-600 mb-4">
        Du er i ferd med å sende en forespørsel om å leie <span className="font-medium">{listingName}</span>
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <FormLabel>Velg datoer</FormLabel>
            <div className="border rounded-md p-4">
              <Calendar
                mode="range"
                selected={{
                  from: startDate,
                  to: endDate
                }}
                onSelect={(range) => {
                  if (range?.from) {
                    form.setValue('startDate', range.from);
                  }
                  if (range?.to) {
                    form.setValue('endDate', range.to);
                  }
                }}
                disabled={(date) =>
                  isBefore(date, new Date()) || 
                  isBefore(date, availableFrom) || 
                  isAfter(date, availableTo)
                }
                numberOfMonths={1}
                locale={nb}
                className="rounded-md"
              />
            </div>
            <div className="flex space-x-4 mt-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Fra dato</FormLabel>
                    <div className="p-2 border rounded-md bg-gray-50">
                      {field.value ? (
                        format(field.value, "PPP", { locale: nb })
                      ) : (
                        <span className="text-gray-400">Velg dato</span>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Til dato</FormLabel>
                    <div className="p-2 border rounded-md bg-gray-50">
                      {field.value ? (
                        format(field.value, "PPP", { locale: nb })
                      ) : (
                        <span className="text-gray-400">Velg dato</span>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Melding til utleier</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Introduser deg selv og fortell hvorfor du ønsker å leie denne gjenstanden..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {startDate && endDate && totalDays > 0 && (
            <div className="py-4 border-t border-gray-100">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{pricePerDay} kr × {totalDays} dager</span>
                  <span>{totalPrice} kr</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Totalt</span>
                  <span>{totalPrice} kr</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              className="w-1/2"
              onClick={() => router.back()}
            >
              Avbryt
            </Button>
            <Button 
              type="submit" 
              className="w-1/2 bg-[#4CD964] hover:bg-[#3CB954] text-white"
              disabled={isSubmitting || !startDate || !endDate}
            >
              {isSubmitting ? "Sender..." : "Send forespørsel"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default RentalRequestForm; 