'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Target, MessageCircle, X, HelpCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LocationSelector } from '@/components/ui/location-selector'
import { Textarea } from "@/components/ui/textarea"

interface GISBotProps {
  isVisible: boolean
  onClose: () => void
  onLocationSelect: (location: string) => void
  currentLocation?: string
  itemName?: string
}

interface LocationSuggestion {
  name: string
  type: 'public_space' | 'community_center' | 'library' | 'park' | 'transport_hub'
  reason: string
  distance?: string
  coordinates?: { lat: number, lng: number }
}

export function GISBot({ isVisible, onClose, onLocationSelect, currentLocation, itemName }: GISBotProps) {
  const [step, setStep] = useState<'welcome' | 'analyzing' | 'suggestions' | 'custom'>('welcome')
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [customLocation, setCustomLocation] = useState('')
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  useEffect(() => {
    if (isVisible && step === 'welcome') {
      // Auto-advance to analyzing after a brief delay
      setTimeout(() => {
        setStep('analyzing')
        generateSuggestions()
      }, 2000)
    }
  }, [isVisible, step])

  const generateSuggestions = async () => {
    setIsLoadingSuggestions(true)
    
    // Simulate API call to generate location suggestions
    // In a real implementation, this would call a GIS service
    setTimeout(() => {
      const baseSuggestions: LocationSuggestion[] = [
        {
          name: 'Oslo Sentrum',
          type: 'public_space',
          reason: 'Høy trafikk og lett tilgjengelig for mange',
          distance: '2.3 km'
        },
        {
          name: 'Deichmanske Bibliotek',
          type: 'library',
          reason: 'Trygg møteplass med god tilgjengelighet',
          distance: '1.8 km'
        },
        {
          name: 'Frognerparken',
          type: 'park',
          reason: 'Populær utleveringsplass for større gjenstander',
          distance: '3.1 km'
        },
        {
          name: 'Oslo S',
          type: 'transport_hub',
          reason: 'Knutepunkt for kollektivtransport',
          distance: '2.7 km'
        }
      ]

      // Filter suggestions based on item type if available
      let filteredSuggestions = baseSuggestions
      if (itemName?.toLowerCase().includes('book') || itemName?.toLowerCase().includes('bok')) {
        filteredSuggestions = baseSuggestions.filter(s => s.type === 'library' || s.type === 'public_space')
      } else if (itemName?.toLowerCase().includes('sport') || itemName?.toLowerCase().includes('bike')) {
        filteredSuggestions = baseSuggestions.filter(s => s.type === 'park' || s.type === 'public_space')
      }

      setSuggestions(filteredSuggestions.slice(0, 3))
      setStep('suggestions')
      setIsLoadingSuggestions(false)
    }, 1500)
  }

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    onLocationSelect(suggestion.name)
    onClose()
  }

  const handleCustomLocationSubmit = () => {
    if (customLocation.trim()) {
      onLocationSelect(customLocation.trim())
      onClose()
    }
  }

  const getBadgeVariant = (type: LocationSuggestion['type']) => {
    switch (type) {
      case 'public_space': return 'default'
      case 'library': return 'secondary'
      case 'park': return 'outline'
      case 'transport_hub': return 'destructive'
      case 'community_center': return 'secondary'
      default: return 'default'
    }
  }

  const getTypeLabel = (type: LocationSuggestion['type']) => {
    switch (type) {
      case 'public_space': return 'Offentlig plass'
      case 'library': return 'Bibliotek'
      case 'park': return 'Park'
      case 'transport_hub': return 'Transportknutepunkt'
      case 'community_center': return 'Samfunnshus'
      default: return 'Annet'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">GIS Stedsassistent</CardTitle>
              <p className="text-sm text-muted-foreground">Hjelper deg med å finne det beste stedet for gratis utdeling</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 'welcome' && (
            <div className="space-y-4 text-center">
              <div className="animate-pulse">
                <MessageCircle className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              </div>
              <h3 className="text-lg font-semibold">Velkommen til GIS Stedsassistent!</h3>
              <p className="text-muted-foreground">
                Jeg hjelper deg med å finne det beste stedet for å dele din gratis gjenstand. 
                La meg analysere området og komme med forslag...
              </p>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="space-y-4 text-center">
              <div className="animate-spin">
                <Target className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              </div>
              <h3 className="text-lg font-semibold">Analyserer området...</h3>
              <p className="text-muted-foreground">
                Ser etter trygge og tilgjengelige steder i nærheten av deg
              </p>
              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '70%' }} />
                </div>
                <p className="text-xs text-muted-foreground">Sjekker offentlige plasser, bibliotek og transportknutepunkter...</p>
              </div>
            </div>
          )}

          {step === 'suggestions' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Anbefalte steder for utdeling</h3>
                <p className="text-sm text-muted-foreground">
                  Basert på tilgjengelighet, sikkerhet og befolkningstetthet
                </p>
              </div>

              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSuggestionSelect(suggestion)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{suggestion.name}</h4>
                            <Badge variant={getBadgeVariant(suggestion.type)}>
                              {getTypeLabel(suggestion.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                          {suggestion.distance && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Navigation className="h-3 w-3" />
                              {suggestion.distance} unna
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          Velg
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="pt-4 border-t space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setStep('custom')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Jeg vil velge et annet sted
                </Button>
              </div>
            </div>
          )}

          {step === 'custom' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">Velg ditt eget sted</h3>
                <p className="text-sm text-muted-foreground">
                  Skriv inn eller velg stedet hvor du vil møte mottakeren
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Søk etter sted</label>
                  <LocationSelector
                    value={customLocation}
                    onChange={setCustomLocation}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">💡 Tips for trygg utdeling:</h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Velg offentlige plasser med god belysning</li>
                    <li>• Møt på dagtid når det er folk i nærheten</li>
                    <li>• Unngå private adresser hvis mulig</li>
                    <li>• Bibliotek og kjøpesentre er ofte gode alternativer</li>
                  </ul>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('suggestions')}
                    className="flex-1"
                  >
                    Tilbake til forslag
                  </Button>
                  <Button 
                    onClick={handleCustomLocationSubmit}
                    disabled={!customLocation.trim()}
                    className="flex-1"
                  >
                    Bruk dette stedet
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}