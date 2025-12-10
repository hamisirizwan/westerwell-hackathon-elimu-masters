import { Button } from "@/components/ui/button"
import { getCourses } from "@/actions/courses/getCourses"
import { Plus, BookOpen } from "lucide-react"
import Link from "next/link"
import { CoursesTable } from "./components/CoursesTable"

export default async function AdminCoursesPage() {
  const result = await getCourses({ status: 'all', limit: 50 })

  const courses = result.success ? result.data?.courses || [] : []
  const totalCount = result.data?.pagination?.totalCount || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Courses</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your courses
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-sm">
            Create your first course to start teaching students.
          </p>
          <Button asChild>
            <Link href="/admin/courses/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Course
            </Link>
          </Button>
        </div>
      ) : (
        <div>
          <div className="text-sm text-muted-foreground mb-4">
            {totalCount} course{totalCount !== 1 ? 's' : ''} total
          </div>
          <CoursesTable courses={courses} />
        </div>
      )}
    </div>
  )
}

