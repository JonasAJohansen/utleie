'use client'

import React, { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, CreditCard, Shield, Lock } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { formatNOK } from '@/lib/stripe'

interface PaymentFormProps {
  onSuccess: () => void
  onBack: () => void
  packageName: string
  amount: number
}

export function PaymentForm({ onSuccess, onBack, packageName, amount }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payments/success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message || 'An error occurred during payment')
        toast({
          title: 'Payment Failed',
          description: error.message || 'Please check your payment details and try again.',
          variant: 'destructive'
        })
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess()
      }
    } catch (error) {
      console.error('Payment error:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaymentElement 
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              },
              paymentMethodOrder: ['card', 'klarna'],
              fields: {
                billingDetails: {
                  name: 'auto',
                  email: 'auto',
                  phone: 'auto',
                  address: {
                    country: 'never',
                    line1: 'auto',
                    line2: 'auto', 
                    city: 'auto',
                    state: 'never',
                    postalCode: 'auto',
                  },
                },
              },
            }}
          />

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Secure payment powered by Stripe</span>
            <Lock className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Pakke:</span>
              <span>{packageName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Beløp:</span>
              <span className="text-lg font-bold text-emerald-600">
                {formatNOK(amount)}
              </span>
            </div>
            <div className="text-xs text-gray-500 pt-2">
              <p>• Betaling vil bli behandlet i NOK (Norske Kroner)</p>
              <p>• Annonsen din vil bli fremhevet umiddelbart etter betaling</p>
              <p>• Du vil motta en e-postbekreftelse</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake
        </Button>
        
        <Button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className="flex-1"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Behandler...' : `Betal ${formatNOK(amount)}`}
        </Button>
      </div>

      <div className="text-center text-xs text-gray-500">
        <p>Ved å fullføre denne betalingen godtar du våre vilkår for tjenesten.</p>
        <p>Alle betalinger er sikre og krypterte.</p>
      </div>
    </form>
  )
}
