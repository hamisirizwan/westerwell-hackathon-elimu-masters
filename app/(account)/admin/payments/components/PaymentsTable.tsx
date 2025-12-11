'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency/converter"
import { CurrencyCode } from "@/lib/currency/rates"
import { PaymentMethod } from "@/lib/enums/paymentMethod"
import Link from "next/link"

interface Payment {
  id: string
  course: {
    id: string
    title: string
    slug: string
  } | null
  student: {
    id: string
    name: string
    email: string
  } | null
  amountPaid: number
  originalAmount: number
  currency: string
  paymentMethod: string
  paymentReference: string
  paymentStatus: string
  phoneNumber?: string
  cardLast4?: string
  paidAt?: string
  createdAt: string
}

interface PaymentsTableProps {
  payments: Payment[]
}

const getPaymentMethodLabel = (method: string) => {
  switch (method) {
    case PaymentMethod.MPESA:
      return 'M-Pesa'
    case PaymentMethod.MTN_MOMO:
      return 'MTN Mobile Money'
    case PaymentMethod.AIRTEL_MONEY:
      return 'Airtel Money'
    case PaymentMethod.ORANGE_MONEY:
      return 'Orange Money'
    case PaymentMethod.CARD:
      return 'Card'
    case PaymentMethod.BANK_TRANSFER:
      return 'Bank Transfer'
    default:
      return method
  }
}

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="default" className="bg-green-500">Completed</Badge>
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>
    case 'refunded':
      return <Badge variant="outline">Refunded</Badge>
    case 'cancelled':
      return <Badge variant="secondary">Cancelled</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment Reference</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-mono text-xs">
                {payment.paymentReference}
              </TableCell>
              <TableCell>
                {payment.course ? (
                  <Link
                    href={`/courses/${payment.course.slug}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {payment.course.title}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell>
                {payment.student ? (
                  <div>
                    <div className="font-medium">{payment.student.name}</div>
                    <div className="text-xs text-muted-foreground">{payment.student.email}</div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {formatCurrency(payment.originalAmount, payment.currency as CurrencyCode)}
                </div>
                {payment.originalAmount !== payment.amountPaid && (
                  <div className="text-xs text-muted-foreground">
                    ({formatCurrency(payment.amountPaid, payment.currency as CurrencyCode)} converted)
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>{getPaymentMethodLabel(payment.paymentMethod)}</div>
                {payment.phoneNumber && (
                  <div className="text-xs text-muted-foreground">{payment.phoneNumber}</div>
                )}
                {payment.cardLast4 && (
                  <div className="text-xs text-muted-foreground">****{payment.cardLast4}</div>
                )}
              </TableCell>
              <TableCell>
                {getPaymentStatusBadge(payment.paymentStatus)}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {new Date(payment.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(payment.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

