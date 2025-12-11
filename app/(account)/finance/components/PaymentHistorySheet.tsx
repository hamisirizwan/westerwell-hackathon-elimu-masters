'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { getEnrollmentPayments } from '@/actions/enrollments/getEnrollmentPayments'
import { PaymentHistoryList } from './PaymentHistoryList'
import { Loader2 } from 'lucide-react'

interface PaymentHistorySheetProps {
  enrollmentId: string
  courseTitle: string
  children: React.ReactNode
}

export function PaymentHistorySheet({ 
  enrollmentId, 
  courseTitle,
  children 
}: PaymentHistorySheetProps) {
  const [open, setOpen] = useState(false)
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)
    
    if (isOpen && payments.length === 0) {
      setLoading(true)
      setError(null)
      
      try {
        const result = await getEnrollmentPayments(enrollmentId)
        
        if (result.success && result.data) {
          setPayments(result.data)
        } else {
          setError(result.message || 'Failed to load payments')
        }
      } catch (err) {
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <>
      <div onClick={() => handleOpenChange(true)}>
        {children}
      </div>
      
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                <span className="text-lg">$</span>
              </div>
              Payment History
            </SheetTitle>
            <SheetDescription>
              {courseTitle}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : payments.length > 0 ? (
              <PaymentHistoryList payments={payments} />
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">
                  No payment history found
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

