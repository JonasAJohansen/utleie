'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Search } from 'lucide-react'
import { Card } from "@/components/ui/card"

const listings = [
  { id: 1, name: 'Mountain Bike', owner: 'John Doe', category: 'Sports & Outdoors', status: 'Active' },
  { id: 2, name: 'DSLR Camera', owner: 'Jane Smith', category: 'Electronics', status: 'Active' },
  { id: 3, name: 'Camping Tent', owner: 'Bob Johnson', category: 'Sports & Outdoors', status: 'Inactive' },
  { id: 4, name: 'Lawn Mower', owner: 'Alice Brown', category: 'Home & Garden', status: 'Active' },
  { id: 5, name: 'Surfboard', owner: 'Charlie Wilson', category: 'Sports & Outdoors', status: 'Active' },
]

export function ListingsTab() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredListings = listings.filter(listing =>
    listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = (id: number) => {
    console.log(`Delete listing with id: ${id}`)
    // Implement delete functionality here
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredListings.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell>{listing.name}</TableCell>
              <TableCell>{listing.owner}</TableCell>
              <TableCell>{listing.category}</TableCell>
              <TableCell>{listing.status}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(listing.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Card>
    </div>
  )
}

