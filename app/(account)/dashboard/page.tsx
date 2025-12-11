import { auth } from "@/lib/auth/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getAdminStats } from "@/actions/dashboard/getAdminStats"
import { getStudentStats } from "@/actions/dashboard/getStudentStats"
import { getStudentActivities } from "@/actions/activities/getStudentActivities"
import { UserRole } from "@/db/models/UserModel"
import { DashboardViewSwitcher } from "./components/DashboardViewSwitcher"

export default async function DashboardPage() {
  const session = await auth()
  const isAdmin = session?.user?.role === UserRole.ADMIN

  // Fetch both admin and student stats, and activities
  const [adminStatsResult, studentStatsResult, activitiesResult] = await Promise.all([
    isAdmin ? getAdminStats() : Promise.resolve({ success: false, message: 'Not admin' }),
    getStudentStats(),
    getStudentActivities(10), // Get last 10 activities
  ])

  const adminStats = adminStatsResult.success && adminStatsResult.data ? adminStatsResult.data : null
  const studentStats = studentStatsResult.success && studentStatsResult.data ? studentStatsResult.data : null
  const activities = activitiesResult.success && activitiesResult.data ? activitiesResult.data : []

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
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t enrolled in any courses yet. Start your learning journey today!
            </p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
