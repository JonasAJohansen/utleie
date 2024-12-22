import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportType: 'listing' | 'user'
  reportedItemId: number | string
  reportedItemName: string
}

export function ReportDialog({ open, onOpenChange, reportType, reportedItemId, reportedItemName }: ReportDialogProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the report to your backend
    console.log('Report submitted:', { reportType, reportedItemId, reportedItemName, reason, description })
    onOpenChange(false)
    setReason('')
    setDescription('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {reportType === 'listing' ? 'Listing' : 'User'}</DialogTitle>
          <DialogDescription>
            Please provide details about why you&apos;re reporting this {reportType}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportedItem">Reported {reportType === 'listing' ? 'Listing' : 'User'}</Label>
              <Input id="reportedItem" value={reportedItemName} disabled />
            </div>
            <div>
              <Label htmlFor="reason">Reason for reporting</Label>
              <Select value={reason} onValueChange={setReason} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="fake">Fake listing</SelectItem>
                  <SelectItem value="offensive">Offensive behavior</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please provide more details about the issue"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit">Submit Report</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

