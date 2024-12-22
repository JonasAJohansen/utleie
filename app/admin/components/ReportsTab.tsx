'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, MessageSquare, Eye } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const initialReports = [
  { 
    id: 1, 
    type: 'user',
    reportedItem: 'John Doe', 
    reportedBy: 'Alice Brown', 
    reason: 'Inappropriate behavior', 
    description: 'The user was using offensive language in chat.',
    status: 'Pending',
    date: '2023-06-15',
    messages: []
  },
  { 
    id: 2, 
    type: 'listing',
    reportedItem: 'Mountain Bike', 
    reportedBy: 'Bob Johnson', 
    reason: 'Fake listing', 
    description: 'The listing for a "brand new mountain bike" is actually for a used bike.',
    status: 'Resolved',
    date: '2023-06-10',
    messages: [
      { sender: 'Admin', content: 'Thank you for your report. We have investigated and taken appropriate action.' },
      { sender: 'Bob Johnson', content: 'Thank you for addressing this issue promptly.' }
    ]
  },
  { 
    id: 3, 
    type: 'user',
    reportedItem: 'Charlie Wilson', 
    reportedBy: 'Eve Davis', 
    reason: 'Harassment', 
    description: 'The user is sending repeated unwanted messages after I declined to rent their item.',
    status: 'Pending',
    date: '2023-06-18',
    messages: []
  },
]

export function ReportsTab() {
  const [reports, setReports] = useState(initialReports)
  const [selectedReport, setSelectedReport] = useState<typeof initialReports[0] | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'listings'>('all')

  const handleResolve = (id: number) => {
    setReports(reports.map(report =>
      report.id === id ? { ...report, status: 'Resolved' } : report
    ))
  }

  const handleDismiss = (id: number) => {
    setReports(reports.filter(report => report.id !== id))
  }

  const handleSendMessage = () => {
    if (selectedReport && newMessage.trim()) {
      const updatedReport = {
        ...selectedReport,
        messages: [...selectedReport.messages, { sender: 'Admin', content: newMessage.trim() }]
      }
      setReports(reports.map(report =>
        report.id === selectedReport.id ? updatedReport : report
      ))
      setSelectedReport(updatedReport)
      setNewMessage('')
    }
  }

  const filteredReports = reports.filter(report => {
    if (activeTab === 'all') return true;
    return report.type === activeTab.slice(0, -1); // Remove 's' from the end
  });

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="users">User Reports</TabsTrigger>
          <TabsTrigger value="listings">Listing Reports</TabsTrigger>
        </TabsList>
      </Tabs>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Reported Item</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.type === 'user' ? 'User' : 'Listing'}</TableCell>
                <TableCell>{report.reportedItem}</TableCell>
                <TableCell>{report.reportedBy}</TableCell>
                <TableCell>{report.reason}</TableCell>
                <TableCell>{report.date}</TableCell>
                <TableCell>
                  <Badge variant={report.status === 'Pending' ? 'default' : 'secondary'}>
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedReport(report)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Report Details</DialogTitle>
                          <DialogDescription>
                            Reported on {report.date} by {report.reportedBy}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                          <div>
                            <h4 className="font-semibold">Reported {report.type === 'user' ? 'User' : 'Listing'}</h4>
                            <p>{report.reportedItem}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Reason</h4>
                            <p>{report.reason}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Description</h4>
                            <p>{report.description}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Messages</h4>
                            {report.messages.length > 0 ? (
                              <div className="space-y-2">
                                {report.messages.map((message, index) => (
                                  <div key={index} className="bg-gray-100 p-2 rounded">
                                    <p className="font-semibold">{message.sender}</p>
                                    <p>{message.content}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p>No messages yet.</p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold">Send a Message</h4>
                            <Textarea
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type your message here..."
                              className="mt-2"
                            />
                            <Button onClick={handleSendMessage} className="mt-2">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Message
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {report.status === 'Pending' && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleResolve(report.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDismiss(report.id)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
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

