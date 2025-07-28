'use client'

import * as React from "react"
import { MapPin } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

// Norwegian locations with coordinates
export const locations = [
  { value: "oslo", label: "Oslo", lat: 59.9139, lng: 10.7522, radius: 2 },
  { value: "bergen", label: "Bergen", lat: 60.3913, lng: 5.3221, radius: 2 },
  { value: "trondheim", label: "Trondheim", lat: 63.4305, lng: 10.3951, radius: 2 },
  { value: "stavanger", label: "Stavanger", lat: 58.9700, lng: 5.7331, radius: 2 },
  { value: "tromso", label: "Tromsø", lat: 69.6492, lng: 18.9553, radius: 2 },
  { value: "nordland", label: "Nordland", lat: 67.0000, lng: 14.0000, radius: 5 },
  { value: "troms-finnmark", label: "Troms og Finnmark", lat: 70.0000, lng: 23.0000, radius: 5 }
] as const

interface LocationSelectorProps {
  value?: string
  onChange: (value: string) => void
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-14 rounded-r-full border-l-0">
        <SelectValue placeholder="Velg sted" />
      </SelectTrigger>
      <SelectContent>
        {locations.map((location) => (
          <SelectItem 
            key={location.value} 
            value={location.value}
            className="cursor-pointer"
          >
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
              {location.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Helper function to get location data by value
export function getLocationByValue(value: string) {
  return locations.find(location => location.value === value) || null;
} 