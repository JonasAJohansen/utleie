import { Badge } from "@/components/ui/badge"
import { Gift } from "lucide-react"

interface PriceDisplayProps {
  price: number
  isFree?: boolean
  showPerDay?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PriceDisplay({ 
  price, 
  isFree = false, 
  showPerDay = true, 
  className = '', 
  size = 'md' 
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  }

  if (isFree || price === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          <Gift className="h-3 w-3 mr-1" />
          GRATIS
        </Badge>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} font-semibold ${className}`}>
      {price} kr{showPerDay && <span className="text-sm font-normal text-muted-foreground">/dag</span>}
    </div>
  )
}