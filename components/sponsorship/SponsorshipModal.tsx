'use client'

import React, { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Crown, TrendingUp, Zap, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { getStripe, isStripeConfiguredClient } from '@/lib/stripe-client'
import { PaymentForm } from './PaymentForm'
import { formatNOK } from '@/lib/stripe'

interface SponsorshipPackage {
  id: string
  name: string
  description: string
  price_nok: number
  duration_days: number
  position_priority: number
  is_active: boolean
  isDefault?: boolean
}

interface SponsorshipModalProps {
  isOpen: boolean
  onClose: () => void
  listingId: string
  listingTitle: string
  userEmail?: string
  userName?: string
  onSuccess?: () => void
}

const packageIcons = {
  'basic': <TrendingUp className="h-6 w-6" />,
  'premium': <Crown className="h-6 w-6" />,
  'extended': <Zap className="h-6 w-6" />
}

const packageColors = {
  'basic': 'bg-blue-500',
  'premium': 'bg-emerald-500', 
  'extended': 'bg-purple-500'
}

export function SponsorshipModal({ 
  isOpen, 
  onClose, 
  listingId, 
  listingTitle, 
  userEmail, 
  userName,
  onSuccess 
}: SponsorshipModalProps) {
  const [packages, setPackages] = useState<SponsorshipPackage[]>([])
  const [selectedPackage, setSelectedPackage] = useState<SponsorshipPackage | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'select' | 'payment'>('select')
  const { toast } = useToast()

  // Load sponsorship packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/sponsorship/packages')
        if (response.ok) {
          const data = await response.json()
          setPackages(data)
        } else {
          throw new Error('Failed to fetch packages')
        }
      } catch (error) {
        console.error('Error fetching packages:', error)
        toast({
          title: 'Feil',
          description: 'Kunne ikke laste sponsorpakker. Prøv igjen.',
          variant: 'destructive'
        })
      }
    }

    if (isOpen) {
      fetchPackages()
    }
  }, [isOpen, toast])

  const handlePackageSelect = async (pkg: SponsorshipPackage) => {
    // Check if Stripe is configured
    if (!isStripeConfiguredClient()) {
      toast({
        title: 'Payment System Not Configured',
        description: 'Stripe payments are not yet configured for this platform. Please contact support.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          listingId,
          userEmail,
          userName
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create payment')
      }

      const { clientSecret } = await response.json()
      setSelectedPackage(pkg)
      setClientSecret(clientSecret)
      setStep('payment')

    } catch (error) {
      console.error('Error creating payment intent:', error)
      toast({
        title: 'Payment Configuration Error',
        description: error instanceof Error ? error.message : 'Payment system is not properly configured. Please contact support.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    toast({
      title: 'Payment Successful!',
      description: `Your listing "${listingTitle}" is now sponsored!`,
    })
    onSuccess?.()
    onClose()
  }

  const handleBack = () => {
    setStep('select')
    setSelectedPackage(null)
    setClientSecret(null)
  }

  const getPackageIcon = (packageId: string) => {
    return packageIcons[packageId as keyof typeof packageIcons] || <Crown className="h-6 w-6" />
  }

  const getPackageColor = (packageId: string) => {
    return packageColors[packageId as keyof typeof packageColors] || 'bg-emerald-500'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-emerald-500" />
            {step === 'select' ? 'Fremhev annonsen din' : 'Fullfør betaling'}
          </DialogTitle>
          <DialogDescription>
            {step === 'select' 
              ? `Få "${listingTitle}" til å skille seg ut med sponset plassering`
              : `Fullfør betaling for ${selectedPackage?.name}`
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`relative cursor-pointer transition-all hover:shadow-lg border-2 ${
                    pkg.position_priority === 2 ? 'border-emerald-200 shadow-md' : 'border-gray-200'
                  }`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  {pkg.position_priority === 2 && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-emerald-500">
                      Mest populær
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getPackageColor(pkg.id)} text-white mx-auto mb-2`}>
                      {getPackageIcon(pkg.id)}
                    </div>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <div className="text-3xl font-bold text-emerald-600">
                      {formatNOK(pkg.price_nok)}
                    </div>
                    <p className="text-sm text-gray-500">{pkg.duration_days} dager</p>
                  </CardHeader>
                  
                  <CardContent className="text-center">
                    <CardDescription className="mb-4">
                      {pkg.description}
                    </CardDescription>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span>Prioritert plassering</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span>Sponset merke</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span>Økt synlighet</span>
                      </div>
                      {pkg.position_priority >= 2 && (
                        <div className="flex items-center justify-center gap-2">
                          <Check className="h-4 w-4 text-emerald-500" />
                          <span>Topp posisjon prioritet</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full mt-4"
                      variant={pkg.position_priority === 2 ? "default" : "outline"}
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Velg pakke
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Slik fungerer sponsede annonser</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Annonsen din vises øverst i søkeresultatene i din kategori</li>
                <li>• Tydelig "Sponset" merke øker tillit og synlighet</li>
                <li>• Tilfeldig rotasjon sikrer rettferdig eksponering blant sponsede annonser</li>
                <li>• Analyse sporing viser ytelsesmålinger</li>
                <li>• Automatisk deaktivering når sponsing utløper</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'payment' && clientSecret && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Ordre sammendrag</h3>
              <div className="flex justify-between items-center">
                <span>{selectedPackage?.name}</span>
                <span className="font-semibold">{formatNOK(selectedPackage?.price_nok || 0)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {selectedPackage?.duration_days} dager med sponset plassering
              </p>
            </div>

            {isStripeConfiguredClient() ? (
              <Elements stripe={getStripe()} options={{ clientSecret }}>
                <PaymentForm 
                  onSuccess={handlePaymentSuccess}
                  onBack={handleBack}
                  packageName={selectedPackage?.name || ''}
                  amount={selectedPackage?.price_nok || 0}
                />
              </Elements>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Betalingssystem ikke tilgjengelig</h3>
                <p className="text-red-800 text-sm">
                  Betalingssystemet er for øyeblikket ikke konfigurert. Kontakt support for å aktivere sponsede annonser.
                </p>
                <Button variant="outline" onClick={handleBack} className="mt-3">
                  Tilbake til pakker
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
