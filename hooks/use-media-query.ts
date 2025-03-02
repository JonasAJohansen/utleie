import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  // Initialize with null to avoid SSR mismatch
  const [matches, setMatches] = useState<boolean>(false)
  
  useEffect(() => {
    // Set up the initial check on client side
    const mediaQuery = window.matchMedia(query)
    
    // Set initial state
    setMatches(mediaQuery.matches)
    
    // Define callback function
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    // Add listener
    mediaQuery.addEventListener('change', handleChange)
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])
  
  return matches
} 