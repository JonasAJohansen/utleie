import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Trash2 } from 'lucide-react'

// This would typically come from a database
const savedSearches = [
  { id: 1, query: 'Mountain bikes in Denver', date: '2023-05-15' },
  { id: 2, query: 'Cameras in New York', date: '2023-05-10' },
  { id: 3, query: 'Camping gear in Portland', date: '2023-05-05' },
]

export default function SavedSearchesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Searches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {savedSearches.map((search) => (
            <div key={search.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold">{search.query}</h3>
                <p className="text-sm text-gray-500">Saved on {search.date}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

