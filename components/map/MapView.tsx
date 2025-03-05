'use client'

import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Listing } from '@/types'
import Image from 'next/image'
import emptyResultsSvg from '@/public/empty-results.svg'
import { useRouter } from 'next/navigation'
import { debounce } from 'lodash'

// Fix Leaflet icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Set Leaflet default icon options
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
})

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow.src,
  shadowSize: [41, 41],
})

interface MapViewProps {
  listings: any[]
  selectedLocation: {
    lat: number
    lng: number
    radius: number
    name: string
  } | null
  isLoading: boolean
  onBoundsChange?: (bounds: {
    north: number
    south: number
    east: number
    west: number
    center: { lat: number, lng: number }
  }) => void
}

export function MapView({ listings, selectedLocation, isLoading, onBoundsChange }: MapViewProps) {
  const router = useRouter()
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null)
  const boundsChangedRef = useRef(false)
  const mapInitializedRef = useRef(false)
  const isLoadingRef = useRef(isLoading)
  const isUserInteracting = useRef(false)
  const mapInteractionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Calculate map center based on selectedLocation or listings
  const mapCenter = useMemo(() => {
    // Only use this calculation for initial map setup, not for updates
    if (selectedLocation) {
      return [selectedLocation.lat, selectedLocation.lng]
    }
    
    if (listings.length > 0 && !mapInitializedRef.current) {
      // Calculate average position of all listings
      const totalLat = listings.reduce((sum, listing) => sum + (parseFloat(listing.latitude) || 0), 0)
      const totalLng = listings.reduce((sum, listing) => sum + (parseFloat(listing.longitude) || 0), 0)
      
      return [totalLat / listings.length, totalLng / listings.length]
    }
    
    // Default center (Oslo)
    return [59.9139, 10.7522]
  }, [selectedLocation, listings, mapInitializedRef.current])
  
  // Calculate zoom level
  const zoomLevel = useMemo(() => {
    if (selectedLocation) {
      // Adjust zoom based on radius
      if (selectedLocation.radius <= 1) return 14
      if (selectedLocation.radius <= 5) return 12
      if (selectedLocation.radius <= 10) return 11
      return 10
    }
    return 12
  }, [selectedLocation])
  
  // Add small random offset to coordinates for privacy (within ~2km)
  const addLocationOffset = (lat: number, lng: number) => {
    // 0.018 degrees is roughly 2km at most latitudes
    const MAX_OFFSET = 0.018;
    
    // Generate a random offset between -MAX_OFFSET and MAX_OFFSET
    // Use the listing ID or some other unique identifier as a seed if possible
    const latOffset = (Math.random() - 0.5) * MAX_OFFSET;
    const lngOffset = (Math.random() - 0.5) * MAX_OFFSET;
    
    return {
      lat: lat + latOffset,
      lng: lng + lngOffset
    };
  }
  
  // Group listings by location to handle overlapping markers
  const markerGroups = useMemo(() => {
    // Don't recalculate if no listings or map not initialized
    if (listings.length === 0 || !mapInitializedRef.current) {
      return {}
    }
    
    const groups: Record<string, any[]> = {}
    
    listings.forEach(listing => {
      const lat = parseFloat(listing.latitude)
      const lng = parseFloat(listing.longitude)
      
      if (isNaN(lat) || isNaN(lng)) return
      
      // Apply privacy offset and use coarser location grouping for privacy
      const offset = addLocationOffset(lat, lng);
      
      // Use coarser precision (3 decimal places instead of 4) to naturally group nearby listings
      const key = `${offset.lat.toFixed(3)}_${offset.lng.toFixed(3)}`
      
      if (!groups[key]) {
        groups[key] = []
      }
      
      groups[key].push({
        ...listing,
        offsetLat: offset.lat,
        offsetLng: offset.lng
      })
    })
    
    return groups
  }, [listings, mapInitializedRef.current])

  // Handle navigation to listing detail page
  const navigateToListing = (listingId: string) => {
    router.push(`/listings/${listingId}`);
  }

  // Cleanup function to destroy map completely
  const destroyMap = () => {
    if (mapRef.current) {
      console.log("Destroying map instance")
      mapRef.current.remove()
      mapRef.current = null
      markersLayerRef.current = null
      mapInitializedRef.current = false
    }
  }

  // Prevent frequent bounds change events and avoid resetting during user interaction
  const emitBoundsChange = useCallback(
    debounce(() => {
      if (!mapRef.current || isLoadingRef.current) return;
      
      try {
        const bounds = mapRef.current.getBounds();
        const center = mapRef.current.getCenter();
        
        if (onBoundsChange && !isUserInteracting.current) {
          console.log("Emitting bounds change to load new listings");
          onBoundsChange({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
            center: {
              lat: center.lat,
              lng: center.lng,
            },
          });
        }
      } catch (error) {
        console.error('Error getting map bounds:', error);
      }
    }, 3500), // Much longer delay (3.5 seconds) to prevent map resets during user exploration
    [onBoundsChange]
  );

  // Track user interaction with the map
  const handleMapMovement = useCallback(() => {
    if (!mapRef.current) return;
    
    // Always set interaction flag to true when map moves
    isUserInteracting.current = true;
    
    // Clear any previous timeout
    if (mapInteractionTimeoutRef.current) {
      clearTimeout(mapInteractionTimeoutRef.current);
    }
    
    // Store the current bounds for comparison
    const currentBounds = mapRef.current.getBounds();
    const currentNorth = currentBounds.getNorth();
    const currentSouth = currentBounds.getSouth();
    const currentEast = currentBounds.getEast();
    const currentWest = currentBounds.getWest();
    
    // Set a timeout to check if the map has actually moved significantly
    // This prevents small adjustments from triggering API calls
    mapInteractionTimeoutRef.current = setTimeout(() => {
      // Only consider interactions finished if the map hasn't moved for 3 seconds
      isUserInteracting.current = false;
      
      // Only emit bounds if they've changed significantly (moved by at least 40%)
      // This prevents constant reloading during small movements
      if (mapRef.current) {
        const newBounds = mapRef.current.getBounds();
        const newNorth = newBounds.getNorth();
        const newSouth = newBounds.getSouth();
        const newEast = newBounds.getEast();
        const newWest = newBounds.getWest();
      
        // Calculate height and width of both bounds in degrees
        const prevHeight = currentNorth - currentSouth;
        const prevWidth = currentEast - currentWest;
        
        // Calculate how much the map has moved as a percentage of viewport
        const northMove = Math.abs(newNorth - currentNorth) / prevHeight;
        const southMove = Math.abs(newSouth - currentSouth) / prevHeight;
        const eastMove = Math.abs(newEast - currentEast) / prevWidth;
        const westMove = Math.abs(newWest - currentWest) / prevWidth;
        
        // Only emit bounds change if movement is significant (>40% of viewport)
        const significantMove = 
          northMove > 0.4 || 
          southMove > 0.4 || 
          eastMove > 0.4 || 
          westMove > 0.4;
          
        console.log('Map movement detected:', { 
          significantMove,
          northMovePercent: (northMove * 100).toFixed(1) + '%',
          southMovePercent: (southMove * 100).toFixed(1) + '%',
          eastMovePercent: (eastMove * 100).toFixed(1) + '%',
          westMovePercent: (westMove * 100).toFixed(1) + '%'
        });
        
        if (significantMove) {
          console.log('Significant movement detected - loading new listings');
          emitBoundsChange();
        } else {
          console.log('Minor movement - not reloading listings');
        }
      }
    }, 3500); // Wait 3.5 seconds after user stops moving the map
  }, [emitBoundsChange]);

  // Initialize map with proper styles and event handling
  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current || mapInitializedRef.current) return;

    try {
      // Create the map with appropriate styles to ensure full display
      const map = L.map(mapContainerRef.current, {
        center: mapCenter as L.LatLngExpression,
        zoom: zoomLevel,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
        fadeAnimation: true, 
        zoomAnimation: true,
        markerZoomAnimation: true,
      });
      
      // Use a more reliable tile provider
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
        className: 'map-tiles', // Add class for styling
      }).addTo(map);
      
      // Add zoom control to different position
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);
      
      // Add event listeners for map movement with debounced handler
      map.on('moveend', handleMapMovement);
      map.on('zoomend', handleMapMovement);
      
      // Track when user starts interacting with map
      map.on('movestart', () => {
        isUserInteracting.current = true;
      });
      
      // Add global click handler for listing navigation
      // @ts-ignore - Add custom handler to window object
      window.listingClick = (id: string) => {
        navigateToListing(id);
      };
      
      // Force a layout recalculation to ensure tiles load correctly
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      mapRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map)
      mapInitializedRef.current = true;

      return () => {
        if (mapRef.current) {
          mapRef.current.off('moveend', handleMapMovement);
          mapRef.current.off('zoomend', handleMapMovement);
          mapRef.current.remove();
          mapRef.current = null;
          mapInitializedRef.current = false;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapCenter, zoomLevel, handleMapMovement, navigateToListing])

  // Update markers function - separate from map initialization
  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !markersLayerRef.current) return
    
    // Clear existing markers
    markersLayerRef.current.clearLayers()
    
    // Update location circle if provided
    if (selectedLocation) {
      L.circle([selectedLocation.lat, selectedLocation.lng], {
        color: '#4CD964',
        fillColor: '#4CD964',
        fillOpacity: 0.1,
        radius: selectedLocation.radius * 1000 // Convert km to meters
      }).addTo(markersLayerRef.current)
    }
    
    // Add markers for each group
    Object.entries(markerGroups).forEach(([key, groupListings]) => {
      const firstListing = groupListings[0]
      const lat = firstListing.offsetLat;
      const lng = firstListing.offsetLng;
      
      // Add a 2km privacy radius circle for each listing/group
      L.circle([lat, lng], {
        color: '#4CD964',
        fillColor: '#4CD964',
        fillOpacity: 0.05,
        radius: 2000 // 2km radius
      }).addTo(markersLayerRef.current as L.LayerGroup);
      
      let marker;
      if (groupListings.length === 1) {
        // Single marker
        const listing = groupListings[0]
        marker = L.marker([lat, lng], { icon: customIcon })
          .bindPopup(`
            <div class="p-2">
              <div class="font-bold">${listing.name}</div>
              <div class="text-sm">${listing.price} kr/dag</div>
              <button 
                class="mt-2 px-3 py-1 bg-[#4CD964] text-white rounded text-xs font-medium" 
                onclick="window.listingClick('${listing.id}')"
              >
                Se detaljer
              </button>
            </div>
          `)
      } else {
        // Cluster marker
        marker = L.marker([lat, lng], {
          icon: L.divIcon({
            html: `<div class="bg-primary text-white rounded-full flex items-center justify-center w-6 h-6 font-bold">${groupListings.length}</div>`,
            className: 'marker-cluster',
            iconSize: L.point(30, 30)
          })
        }).bindPopup(`
          <div class="p-2">
            <div class="font-bold">${groupListings.length} annonser i dette området</div>
            <div class="mt-2 grid grid-cols-1 gap-2">
              ${groupListings.slice(0, 3).map(listing => `
                <div class="border-b pb-1">
                  <div class="font-medium">${listing.name}</div>
                  <div class="text-xs">${listing.price} kr/dag</div>
                  <button 
                    class="mt-1 px-2 py-0.5 bg-[#4CD964] text-white rounded text-xs" 
                    onclick="window.listingClick('${listing.id}')"
                  >
                    Se detaljer
                  </button>
                </div>
              `).join('')}
              ${groupListings.length > 3 ? `<div class="text-xs text-center mt-1">+${groupListings.length - 3} flere</div>` : ''}
            </div>
          </div>
        `)
      }
      
      marker.addTo(markersLayerRef.current!)
    })
  }, [selectedLocation, markerGroups])

  // Use effect to initialize map
  useEffect(() => {
    const cleanup = initializeMap();
    
    return () => {
      if (cleanup) cleanup();
      if (mapInteractionTimeoutRef.current) {
        clearTimeout(mapInteractionTimeoutRef.current);
      }
    };
  }, [initializeMap]);
  
  // Update view when selectedLocation changes - ONLY change this if user explicitly selects a location
  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return
    
    // Only update the map view if the selectedLocation was explicitly changed by the user
    // (not as a result of a search or category change)
    mapRef.current.setView(
      [selectedLocation.lat, selectedLocation.lng], 
      selectedLocation.radius <= 1 ? 14 : 
      selectedLocation.radius <= 5 ? 12 : 
      selectedLocation.radius <= 10 ? 11 : 10
    )
  }, [selectedLocation])
  
  // Update markers when listings or selectedLocation change
  useEffect(() => {
    // Update markers only if map is initialized
    if (mapInitializedRef.current) {
      updateMarkers()
    }
  }, [listings, selectedLocation, updateMarkers])
  
  // Ensure map responds correctly to container size changes
  useEffect(() => {
    if (mapRef.current && mapInitializedRef.current) {
      mapRef.current.invalidateSize();
    }
  }, []);
  
  // Handle window resize to keep map responsive
  useEffect(() => {
    const handleResize = debounce(() => {
      if (mapRef.current && mapInitializedRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 200);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update isLoadingRef when isLoading changes
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Force re-render the map tiles after initialization
  useEffect(() => {
    if (mapRef.current && mapInitializedRef.current) {
      // Force multiple invalidates to ensure tiles load correctly
      const invalidateTimes = [100, 300, 600, 1000];
      
      invalidateTimes.forEach(time => {
        setTimeout(() => {
          if (mapRef.current) {
            console.log(`Invalidating map size at ${time}ms`);
            mapRef.current.invalidateSize(true);
          }
        }, time);
      });
    }
  }, [mapInitializedRef.current]);

  // JSX to render loading state or empty results as overlay
  // Now we'll always return the map container but add overlays when needed
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Map container with explicit dimensions and pointer events */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          zIndex: 1,
          pointerEvents: 'auto',
          overflow: 'hidden'
        }}
      />
      
      {/* Ensure tiles load fully by forcing container to be visible */}
      <style jsx global>{`
        .leaflet-container {
          width: 100% !important;
          height: 100% !important;
          z-index: 1;
          background: #f8f9fa;
          overflow: hidden !important;
        }
        .leaflet-control-container {
          z-index: 20;
        }
        .map-tiles {
          z-index: 2;
        }
      `}</style>
      
      {/* Loading overlay */}
      {isLoading && !mapInitializedRef.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* No results overlay - shown as a floating card instead of replacing the map */}
      {listings.length === 0 && !isLoading && (
        <div className="absolute top-4 left-4 right-4 z-20 bg-white/90 p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-gray-900">Ingen annonser funnet</h3>
          <p className="text-sm text-gray-500 mt-1">
            Prøv å justere søket ditt eller flytt kartet til et annet område.
          </p>
        </div>
      )}
    </div>
  )
}

export default MapView; 
