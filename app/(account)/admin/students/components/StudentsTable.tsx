'use client'

import Link from "next/link"
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
import type { AdminEnrollment } from "@/actions/enrollments/getAllEnrollments"

const statusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-green-500">Active</Badge>
    case 'completed':
      return <Badge variant="outline">Completed</Badge>
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>
    case 'cancelled':
    case 'expired':
      return <Badge variant="destructive" className="capitalize">{status}</Badge>
    default:
      return <Badge variant="secondary" className="capitalize">{status}</Badge>
  }
}

export function StudentsTable({ enrollments }: { enrollments: AdminEnrollment[] }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Enrolled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => {
            const currency = enrollment.currency as CurrencyCode
            return (
              <TableRow key={enrollment.id}>
                <TableCell>
                  {enrollment.student ? (
                    <div>
                      <div className="font-medium">{enrollment.student.username}</div>
                      <div className="text-xs text-muted-foreground">{enrollment.student.email}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  {enrollment.course ? (
                    <Link
                      href={`/courses/${enrollment.course.slug}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {enrollment.course.title}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {formatCurrency(enrollment.paidAmount, currency)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    of {formatCurrency(enrollment.totalExpectedPayment, currency)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={enrollment.balance > 0 ? "text-amber-600 font-medium" : "text-green-600 font-medium"}>
                    {formatCurrency(enrollment.balance, currency)}
                  </div>
                </TableCell>
                <TableCell>{statusBadge(enrollment.enrollmentStatus)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {enrollment.enrolledAt
                      ? new Date(enrollment.enrolledAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

