import { useState, useEffect } from 'react'

interface GeolocationState {
  coordinates: {
    latitude: number
    longitude: number
  } | null
  isLoading: boolean
  error: string | null
  city: string | null
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

// Norwegian major cities for fallback
const NORWEGIAN_CITIES = {
  'Oslo': { latitude: 59.9139, longitude: 10.7522 },
  'Bergen': { latitude: 60.3913, longitude: 5.3221 },
  'Trondheim': { latitude: 63.4305, longitude: 10.3951 },
  'Stavanger': { latitude: 58.9700, longitude: 5.7331 },
  'Tromsø': { latitude: 69.6492, longitude: 18.9553 },
  'Kristiansand': { latitude: 58.1599, longitude: 8.0182 },
  'Drammen': { latitude: 59.7440, longitude: 10.2045 },
  'Fredrikstad': { latitude: 59.2181, longitude: 10.9298 }
}

export const useGeolocation = (options?: GeolocationOptions) => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    isLoading: false,
    error: null,
    city: null
  })

  // Function to get city name from coordinates
  const getCityFromCoordinates = async (lat: number, lng: number): Promise<string | null> => {
    try {
      // Simple distance calculation to find nearest Norwegian city
      let nearestCity = null
      let minDistance = Infinity

      Object.entries(NORWEGIAN_CITIES).forEach(([city, coords]) => {
        const distance = Math.sqrt(
          Math.pow(lat - coords.latitude, 2) + Math.pow(lng - coords.longitude, 2)
        )
        if (distance < minDistance) {
          minDistance = distance
          nearestCity = city
        }
      })

      // If very close to a major city (within ~50km), return it
      if (minDistance < 0.5) {
        return nearestCity
      }

      // Try to get more specific location from Norwegian postal code API
      try {
        const response = await fetch(`/api/location/reverse?lat=${lat}&lng=${lng}`)
        if (response.ok) {
          const data = await response.json()
          return data.city || nearestCity
        }
      } catch (err) {
        console.warn('Reverse geocoding failed:', err)
      }

      return nearestCity
    } catch (error) {
      console.warn('Error determining city:', error)
      return null
    }
  }

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        isLoading: false
      }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    const defaultOptions: GeolocationOptions = {
      enableHighAccuracy: false, // Set to false for faster response
      timeout: 10000, // 10 seconds
      maximumAge: 300000, // 5 minutes cache
      ...options
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        
        const city = await getCityFromCoordinates(coordinates.latitude, coordinates.longitude)
        
        setState({
          coordinates,
          isLoading: false,
          error: null,
          city
        })
      },
      (error) => {
        let errorMessage = 'Failed to get location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false
        }))
      },
      defaultOptions
    )
  }

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Get distance to a specific listing
  const getDistanceToListing = (listingLat: number, listingLng: number): number | null => {
    if (!state.coordinates) return null
    return calculateDistance(
      state.coordinates.latitude,
      state.coordinates.longitude,
      listingLat,
      listingLng
    )
  }

  return {
    ...state,
    getCurrentPosition,
    calculateDistance,
    getDistanceToListing
  }
} 