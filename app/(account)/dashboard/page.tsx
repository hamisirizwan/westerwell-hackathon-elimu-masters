import { auth } from "@/lib/auth/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getAdminStats } from "@/actions/dashboard/getAdminStats"
import { getStudentStats } from "@/actions/dashboard/getStudentStats"
import { getStudentActivities } from "@/actions/activities/getStudentActivities"
import { getStudentEnrollments } from "@/actions/enrollments/getStudentEnrollments"
import { UserRole } from "@/db/models/UserModel"
import { DashboardViewSwitcher } from "./components/DashboardViewSwitcher"
import { EnrollmentStatus } from "@/db/models/EnrollmentModel"

export default async function DashboardPage() {
  const session = await auth()
  const isAdmin = session?.user?.role === UserRole.ADMIN

  // Fetch both admin and student stats, activities, and enrollments
  const [adminStatsResult, studentStatsResult, activitiesResult, enrollmentsResult] = await Promise.all([
    isAdmin ? getAdminStats() : Promise.resolve({ success: false, message: 'Not admin' }),
    getStudentStats(),
    getStudentActivities(10), // Get last 10 activities
    !isAdmin ? getStudentEnrollments() : Promise.resolve({ success: false, message: 'Not needed' }),
  ])

  const adminStats = adminStatsResult.success && 'data' in adminStatsResult ? adminStatsResult.data : null
  const studentStats = studentStatsResult.success && 'data' in studentStatsResult ? studentStatsResult.data : null
  const activities = activitiesResult.success && 'data' in activitiesResult ? activitiesResult.data : []
  const enrollments = (enrollmentsResult.success && 'data' in enrollmentsResult && enrollmentsResult.data) ? enrollmentsResult.data : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {session?.user?.username || 'User'}!</h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? 'Here\'s an overview of your platform' : 'Here\'s an overview of your learning progress'}
        </p>
      </div>

      {adminStats && studentStats ? (
        <DashboardViewSwitcher 
          isAdmin={isAdmin}
          adminStats={adminStats}
          studentStats={studentStats}
          activities={activities}
        />
      ) : studentStats ? (
        <DashboardViewSwitcher 
          isAdmin={false}
          adminStats={adminStats || {
            totalCourses: 0,
            publishedCourses: 0,
            totalStudents: 0,
            totalEnrollments: 0,
            activeEnrollments: 0,
            totalPayments: 0,
            totalRevenue: 0,
            paymentsOverTime: [],
            enrollmentsOverTime: [],
          }}
          studentStats={studentStats}
          activities={activities}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Unable to load dashboard statistics
        </div>
      )}

      {!isAdmin && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Continue Learning</h2>
          {enrollments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enrollments
                .filter((enrollment) => 
                  enrollment.enrollmentStatus === EnrollmentStatus.ACTIVE && enrollment.course
                )
                .slice(0, 3)
                .map((enrollment) => {
                  const course = enrollment.course!
                  return (
                    <div
                      key={enrollment.id}
                      className="rounded-lg border p-4 hover:shadow-md transition-shadow"
                    >
                      {course.thumbnail && (
                        <div className="relative w-full h-32 overflow-hidden bg-muted rounded-lg mb-3">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h3 className="font-semibold mb-2 line-clamp-2">{course.title}</h3>
                      <Link href={`/learn/${course.slug}`}>
                        <Button className="w-full" size="sm">
                          Continue Learning
                        </Button>
                      </Link>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t enrolled in any courses yet. Start your learning journey today!
              </p>
              <Button asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
