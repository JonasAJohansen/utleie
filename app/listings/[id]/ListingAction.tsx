'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import RentalRequestForm from '@/components/rental/RentalRequestForm';
import { Listing } from '@/types/listing';
import { Calendar, CalendarIcon, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

interface ListingActionProps {
  listing: Listing;
  userId: string | null;
}

export function ListingAction({ listing, userId }: ListingActionProps) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [step, setStep] = useState<'date' | 'endDate' | 'confirm'>('date');
  
  const handleRentClick = () => {
    if (!userId) {
      toast({
        title: "Logg inn for å fortsette",
        description: "Du må være logget inn for å sende leieforespørsel.",
        variant: "destructive",
      });
      router.push('/sign-in');
      return;
    }
    
    if (listing.user_id === userId) {
      toast({
        title: "Kan ikke leie egen gjenstand",
        description: "Du kan ikke leie din egen gjenstand.",
        variant: "destructive",
      });
      return;
    }
    
    setShowRequestForm(true);
  };
  
  if (!userId) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="text-2xl font-bold mb-2">{listing.price} kr <span className="text-base font-normal text-gray-500">per dag</span></div>
        <Button className="w-full bg-[#4CD964] text-white" asChild>
          <Link href="/sign-in">Logg inn for å leie</Link>
        </Button>
      </div>
    );
  }

  if (listing.user_id === userId) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="text-gray-700 mb-4">Dette er din annonse</div>
        <Button className="w-full bg-[#4CD964] text-white" asChild>
          <Link href={`/listings/${listing.id}/edit`}>Rediger annonse</Link>
        </Button>
      </div>
    );
  }

  const available_from_date = new Date(listing.available_from);
  const available_to_date = new Date(listing.available_to);

  const handleDateSelected = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    setStep('endDate');
  };

  const handleEndDateSelected = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setEndDate(selectedDate);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!date || !endDate) return;

    try {
      const response = await fetch('/api/rental-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id,
          startDate: date.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunne ikke sende leieforespørsel');
      }

      toast({
        title: "Leieforespørsel sendt!",
        description: "Eieren vil få beskjed om din forespørsel.",
      });

      router.push('/dashboard');
    } catch (error) {
      toast({
        title: "Feil",
        description: error instanceof Error ? error.message : "En feil oppstod",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">{listing.price} kr<span className="text-sm text-gray-500 font-normal">/dag</span></h3>
              {listing.security_deposit && listing.security_deposit > 0 && (
                <p className="text-sm text-gray-500">+ {listing.security_deposit} kr depositum</p>
              )}
            </div>
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Verifisert</span>
            </div>
          </div>
          
          {showRequestForm ? (
            <RentalRequestForm 
              listingId={listing.id}
              listingName={listing.name}
              pricePerDay={listing.price}
              userIsOwner={listing.user_id === userId}
            />
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Tilgjengelig</p>
                <div className="flex items-center text-gray-700">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <p>{format(new Date(listing.available_from), 'd. MMMM', { locale: nb })} - {format(new Date(listing.available_to), 'd. MMMM', { locale: nb })}</p>
                </div>
              </div>
              
              {step === 'date' && (
                <>
                  <p className="text-gray-600 mb-4">Velg startdato for utleie:</p>
                  {/* Temporarily commented out due to TS build issues 
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mb-4",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: nb }) : <span>Velg dato</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <div className="calendar-wrapper">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={handleDateSelected}
                          initialFocus
                          disabled={(date) => 
                            date < new Date() || 
                            date < available_from_date || 
                            date > available_to_date
                          }
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  */}
                  <Button
                    className="w-full bg-[#4CD964] text-white"
                    onClick={() => setStep('endDate')}
                  >
                    Fortsett til neste steg
                  </Button>
                </>
              )}

              {step === 'endDate' && (
                <>
                  <p className="text-gray-600 mb-2">Startdato: {date && format(date, "PPP", { locale: nb })}</p>
                  <p className="text-gray-600 mb-4">Velg sluttdato for utleie:</p>
                  {/* Temporarily commented out due to TS build issues 
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mb-4",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP", { locale: nb }) : <span>Velg dato</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateSelected}
                        initialFocus
                        disabled={(currentDate) => 
                          currentDate < new Date() || 
                          currentDate < (date || new Date()) || 
                          currentDate > available_to_date
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setStep('date')}
                    >
                      Tilbake
                    </Button>
                    <Button 
                      className="flex-1 bg-[#4CD964] text-white"
                      onClick={() => setStep('confirm')}
                    >
                      Fortsett til bekreftelse
                    </Button>
                  </div>
                </>
              )}

              {step === 'confirm' && (
                <>
                  <div className="space-y-4 mb-4">
                    <div>
                      <p className="text-gray-600">Startdato:</p>
                      <p className="font-medium">{date && format(date, "PPP", { locale: nb })}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sluttdato:</p>
                      <p className="font-medium">{endDate && format(endDate, "PPP", { locale: nb })}</p>
                    </div>
                    {date && endDate && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-gray-600">
                          <span>Dager:</span>
                          <span>{Math.ceil((endDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) + 1)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg mt-1">
                          <span>Totalt:</span>
                          <span>{listing.price * Math.ceil((endDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) + 1)} kr</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setStep('endDate')}
                    >
                      Tilbake
                    </Button>
                    <Button 
                      className="flex-1 bg-[#4CD964] text-white"
                      onClick={handleConfirm}
                    >
                      Send leieforespørsel
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {!showRequestForm && (
        <Alert variant="default" className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-800 text-sm ml-2">
            Denne gjenstanden er populær. {Math.floor(Math.random() * 8) + 3} andre har sett på den siste 24 timer.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 