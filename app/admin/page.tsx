import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, Tag, BarChart2, AlertTriangle, DollarSign } from 'lucide-react'

const stats = [
  { name: 'Total Listings', value: 1234, icon: Package },
  { name: 'Total Users', value: 5678, icon: Users },
  { name: 'Categories', value: 25, icon: Tag },
  { name: 'Total Revenue', value: '$12,345', icon: DollarSign },
  { name: 'Active Rentals', value: 89, icon: BarChart2 },
  { name: 'Pending Reports', value: 7, icon: AlertTriangle },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

