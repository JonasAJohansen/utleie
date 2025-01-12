import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Package, Users, Tag, BarChart2, AlertTriangle, DollarSign } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { CategoryManager } from "../components/ui/category-manager"

const stats = [
  { name: 'Total Listings', value: 1234, icon: Package },
  { name: 'Total Users', value: 5678, icon: Users },
  { name: 'Categories', value: 25, icon: Tag },
  { name: 'Total Revenue', value: '$12,345', icon: DollarSign },
  { name: 'Active Rentals', value: 89, icon: BarChart2 },
  { name: 'Pending Reports', value: 7, icon: AlertTriangle },
]

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Kategorier</CardTitle>
            <CardDescription>Administrer kategorier for utleie</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryManager />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rapporter</CardTitle>
            <CardDescription>Håndter rapporterte annonser og brukere</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-gray-500">Kommer snart</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistikk</CardTitle>
            <CardDescription>Se plattformstatistikk og analyser</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Totale Tall</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Aktive Brukere</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Totale Annonser</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Systemstatus</CardTitle>
            <CardDescription>Overvåk systemets tilstand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Database</span>
                <Badge>Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Lagring</span>
                <Badge>Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>API</span>
                <Badge>Online</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

