'use client'

import { AnimatedSearchCard } from "@/components/ui/animated-search-card"

interface ItemGridProps {
  items: any[]
}

export function ItemGrid({ items }: ItemGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <AnimatedSearchCard key={item.id} item={item} index={index} />
      ))}
    </div>
  )
}

