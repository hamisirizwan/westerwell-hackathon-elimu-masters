import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, GraduationCap, Clock, Award } from "lucide-react"
import { ActivityTimeline } from "./ActivityTimeline"

interface StudentStatsProps {
  stats: {
    enrolledCourses: number
    activeCourses: number
    completedCourses: number
    hoursLearned: number
    certificates: number
  }
  activities?: Array<{
    id: string
    activityType: string
    title: string
    description?: string
    metadata?: Record<string, any>
    createdAt: string
  }>
}

export function StudentStats({ stats, activities = [] }: StudentStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeCourses} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedCourses}</div>
          <p className="text-xs text-muted-foreground">Courses finished</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.hoursLearned}</div>
          <p className="text-xs text-muted-foreground">Total learning time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Certificates</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.certificates}</div>
          <p className="text-xs text-muted-foreground">Earned credentials</p>
        </CardContent>
      </Card>
      </div>

      {/* Activity Timeline */}
      <ActivityTimeline activities={activities} />
    </div>
  )
}

