import { BookOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: 'My Courses',
  description: 'View your enrolled courses',
}

export default function MyCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          View and continue your enrolled courses
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4 mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No enrolled courses yet</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          You haven&apos;t enrolled in any courses yet. Browse our catalog to find courses that interest you.
        </p>
        <Button asChild>
          <Link href="/account/courses">Browse Courses</Link>
        </Button>
      </div>
    </div>
  )
}
