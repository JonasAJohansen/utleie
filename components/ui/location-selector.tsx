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

// Norwegian locations (major cities and regions)
export const locations = [
  { value: "oslo", label: "Oslo" },
  { value: "bergen", label: "Bergen" },
  { value: "trondheim", label: "Trondheim" },
  { value: "stavanger", label: "Stavanger" },
  { value: "tromso", label: "Tromsø" },
  { value: "nordland", label: "Nordland" },
  { value: "troms-finnmark", label: "Troms og Finnmark" }
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
            {location.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 