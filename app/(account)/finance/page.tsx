import { Wallet, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getStudentEnrollments } from "@/actions/enrollments/getStudentEnrollments"
import { EnrollmentStatus } from "@/db/models/EnrollmentModel"
import { formatCurrency } from "@/lib/currency/converter"
import { PaymentHistorySheet } from "./components/PaymentHistorySheet"
import { CurrencyCode } from "@/lib/currency/rates"

export const metadata = {
  title: 'Finance Overview',
  description: 'View your course payment statuses and history',
}

export default async function FinancePage() {
  const result = await getStudentEnrollments()

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Finance Overview</h1>
          <p className="text-muted-foreground mt-1">
            View your course payment statuses and history
          </p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {result.message || 'Failed to load enrollments'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const enrollments = result.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance Overview</h1>
        <p className="text-muted-foreground mt-1">
          View your course payment statuses and history
        </p>
      </div>

      {enrollments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            if (!enrollment.course) return null

            const course = enrollment.course
            const isFreeCourse = enrollment.totalExpectedPayment === 0
            const isFullyPaid = enrollment.isFullyPaid
            const paymentProgress = enrollment.totalExpectedPayment > 0
              ? (enrollment.paidAmount / enrollment.totalExpectedPayment) * 100
              : 100

            return (
              <Card key={enrollment.id} className="overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  {/* Course Title */}
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {course.title}
                    </h3>
                  </div>

                  {/* Financial Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expected Amount:</span>
                      <span className="font-medium">
                        {formatCurrency(enrollment.totalExpectedPayment, (enrollment.currency || course.currency) as CurrencyCode)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount Paid:</span>
                      <span className="font-medium">
                        {formatCurrency(enrollment.paidAmount, (enrollment.currency || course.currency) as CurrencyCode)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Balance:</span>
                      <span className={`font-medium ${enrollment.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(enrollment.balance, (enrollment.currency || course.currency) as CurrencyCode)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Payment Progress</span>
                      <span className="font-medium">{paymentProgress.toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={paymentProgress} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {isFreeCourse 
                        ? 'Fully sponsored' 
                        : isFullyPaid 
                        ? 'Fully paid' 
                        : 'Keep going!'
                      }
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      asChild
                      disabled={isFullyPaid || isFreeCourse}
                      className="flex-1"
                      variant={isFullyPaid || isFreeCourse ? "outline" : "default"}
                    >
                      {isFullyPaid || isFreeCourse ? (
                        <span>
                          <Wallet className="h-4 w-4 mr-2" />
                          Make Payment
                        </span>
                      ) : (
                        <Link href={`/make-payment/${course.slug}`}>
                          <Wallet className="h-4 w-4 mr-2" />
                          Make Payment
                        </Link>
                      )}
                    </Button>
                    <PaymentHistorySheet
                      enrollmentId={enrollment.id}
                      courseTitle={course.title}
                    >
                      <Button variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Payments
                      </Button>
                    </PaymentHistorySheet>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              No enrollments found. Enroll in a course to see payment information here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

