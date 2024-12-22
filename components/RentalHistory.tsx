import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from 'lucide-react'

interface RentalHistoryItem {
  id: number
  itemName: string
  startDate: string
  endDate: string
  totalPrice: number
  status: 'active' | 'completed' | 'cancelled'
  location: string
}

interface RentalHistoryProps {
  rentals: RentalHistoryItem[]
}

export function RentalHistory({ rentals }: RentalHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rental History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rentals.map((rental) => (
            <Card key={rental.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-semibold">{rental.itemName}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {rental.startDate} - {rental.endDate}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {rental.location}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${rental.totalPrice.toFixed(2)}</p>
                  <Badge 
                    variant={
                      rental.status === 'active' ? 'default' : 
                      rental.status === 'completed' ? 'secondary' : 
                      'destructive'
                    }
                    className="mt-2"
                  >
                    {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

