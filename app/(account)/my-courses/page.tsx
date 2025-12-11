import { BookOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getStudentEnrollments } from "@/actions/enrollments/getStudentEnrollments"
import { EnrollmentStatus } from "@/db/models/EnrollmentModel"
import { formatCurrency } from "@/lib/currency/converter"

export const metadata = {
  title: 'My Courses',
  description: 'View your enrolled courses',
}

export default async function MyCoursesPage() {
  const result = await getStudentEnrollments()

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-muted-foreground mt-1">
            View and continue your enrolled courses
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
        <h1 className="text-2xl font-bold">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          View and continue your enrolled courses
        </p>
      </div>

      {enrollments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            if (!enrollment.course) return null

            const course = enrollment.course
            const paymentProgress = enrollment.totalExpectedPayment > 0
              ? (enrollment.paidAmount / enrollment.totalExpectedPayment) * 100
              : 100

            const getStatusBadge = () => {
              switch (enrollment.enrollmentStatus) {
                case EnrollmentStatus.ACTIVE:
                  return <Badge className="bg-green-600">Active</Badge>
                case EnrollmentStatus.PENDING:
                  return <Badge variant="secondary">Pending Payment</Badge>
                case EnrollmentStatus.COMPLETED:
                  return <Badge variant="default">Completed</Badge>
                case EnrollmentStatus.CANCELLED:
                  return <Badge variant="destructive">Cancelled</Badge>
                default:
                  return <Badge variant="outline">{enrollment.enrollmentStatus}</Badge>
              }
            }

            return (
              <Card
                key={enrollment.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
              >
                {/* Course Thumbnail */}
                {course.thumbnail && (
                  <div className="relative w-full h-48 overflow-hidden bg-muted">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Course Info */}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2 text-lg">
                        {course.title}
                      </CardTitle>
                    </div>
                    {getStatusBadge()}
                  </div>
                  {course.category && (
                    <Badge variant="secondary" className="mb-2">
                      {course.category}
                    </Badge>
                  )}
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                {/* Payment Progress */}
                {!enrollment.isFullyPaid && (
                  <CardContent className="pt-0 pb-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Payment Progress</span>
                        <span className="font-medium">{paymentProgress.toFixed(0)}%</span>
                      </div>
                      <Progress value={paymentProgress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Paid: {formatCurrency(enrollment.paidAmount, course.currency as any)}
                        </span>
                        <span>
                          Remaining: {formatCurrency(enrollment.balance, course.currency as any)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                )}

                {/* Course Footer */}
                <CardContent className="flex flex-col flex-grow justify-between gap-4 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {course.level && (
                        <Badge variant="outline">{course.level}</Badge>
                      )}
                    </div>
                  </div>

                  {enrollment.enrollmentStatus === EnrollmentStatus.ACTIVE ? (
                    <Link
                      href={`/courses/${course.slug}`}
                      className="w-full"
                    >
                      <Button className="w-full">Continue Learning</Button>
                    </Link>
                  ) : enrollment.enrollmentStatus === EnrollmentStatus.PENDING ? (
                    <Link
                      href={`/courses/${course.slug}`}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full">View Course</Button>
                    </Link>
                  ) : (
                    <Link
                      href={`/courses/${course.slug}`}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full">View Course</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No enrolled courses yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-sm">
            You haven&apos;t enrolled in any courses yet. Browse our catalog to find courses that interest you.
          </p>
          <Button asChild>
            <Link href="/explore">Browse Courses</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
