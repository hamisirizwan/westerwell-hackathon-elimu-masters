'use client'

import { Badge } from '@/components/ui/badge'
import { Calendar, Smartphone, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/currency/converter'
import { CurrencyCode } from '@/lib/currency/rates'
import { PaymentMethod } from '@/lib/enums/paymentMethod'
import { PaymentStatus } from '@/lib/enums/paymentStatus'

interface PaymentHistoryListProps {
  payments: Array<{
    id: string
    amountPaid: number
    originalAmount: number
    previousBalance: number
    newBalance: number
    currency: string
    enrollmentCurrency?: string
    paymentMethod: string
    paymentReference: string
    paymentStatus: string
    phoneNumber?: string
    cardLast4?: string
    paidAt?: string
    initiatedAt: string
    createdAt: string
  }>
}

export function PaymentHistoryList({ payments }: PaymentHistoryListProps) {
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case PaymentMethod.MPESA:
      case PaymentMethod.MTN_MOMO:
      case PaymentMethod.AIRTEL_MONEY:
      case PaymentMethod.ORANGE_MONEY:
        return <Smartphone className="h-4 w-4" />
      case PaymentMethod.CARD:
        return <CreditCard className="h-4 w-4" />
      default:
        return <Smartphone className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${day}/${month}/${year} at ${hours}:${minutes}:${seconds}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return <Badge variant="default" className="bg-green-600">Completed</Badge>
      case PaymentStatus.PENDING:
        return <Badge variant="secondary">Pending</Badge>
      case PaymentStatus.FAILED:
        return <Badge variant="destructive">Failed</Badge>
      case PaymentStatus.REFUNDED:
        return <Badge variant="outline">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
        >
          {/* Payment Method and Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-green-600">
                {getPaymentMethodIcon(payment.paymentMethod)}
              </div>
              <span className="font-medium uppercase text-sm">
                {payment.paymentMethod.replace(/_/g, ' ')}
              </span>
            </div>
            {getStatusBadge(payment.paymentStatus)}
          </div>

          {/* Transaction ID */}
          <div>
            <span className="text-xs text-muted-foreground">Transaction ID:</span>
            <span className="ml-2 font-mono text-sm">{payment.paymentReference}</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(payment.paidAt || payment.createdAt)}</span>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm flex-1">
              <div className="text-muted-foreground mb-1">Amount</div>
              <div className="font-bold text-lg">
                {formatCurrency(payment.originalAmount, payment.currency as CurrencyCode)}
              </div>
            </div>
          </div>

          {/* Balance Details */}
          <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex justify-between">
              <span>Previous Bal:</span>
              <span className="font-medium lowercase">
                {formatCurrency(payment.previousBalance, (payment.enrollmentCurrency || payment.currency) as CurrencyCode).toLowerCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>New Bal:</span>
              <span className="font-medium lowercase">
                {formatCurrency(payment.newBalance, (payment.enrollmentCurrency || payment.currency) as CurrencyCode).toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

