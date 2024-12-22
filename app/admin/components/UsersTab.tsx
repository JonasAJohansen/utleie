'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Ban, Search, AlertTriangle } from 'lucide-react'
import { Card } from "@/components/ui/card"

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', joinDate: '2023-01-15', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', joinDate: '2023-02-20', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', joinDate: '2023-03-10', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', joinDate: '2023-04-05', status: 'Active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', joinDate: '2023-05-01', status: 'Frozen' },
]

export function UsersTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [userList, setUserList] = useState(users)

  const filteredUsers = userList.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStatusChange = (id: number, newStatus: string) => {
    setUserList(userList.map(user =>
      user.id === id ? { ...user, status: newStatus } : user
    ))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
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
            <TableHead>Email</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.joinDate}</TableCell>
              <TableCell>
                <Badge 
                  variant={user.status === 'Active' ? 'default' : user.status === 'Inactive' ? 'secondary' : 'destructive'}
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {user.status === 'Active' && (
                    <Button variant="ghost" size="icon" onClick={() => handleStatusChange(user.id, 'Frozen')}>
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                  )}
                  {user.status === 'Frozen' && (
                    <Button variant="ghost" size="icon" onClick={() => handleStatusChange(user.id, 'Active')}>
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Card>
    </div>
  )
}

