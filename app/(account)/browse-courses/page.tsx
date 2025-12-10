import { BookOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Course } from "@/db/models/CourseModel"
import dbConnect from "@/db/dbConnect"

export const metadata = {
  title: 'Browse Courses',
  description: 'Browse and enroll in available courses',
}

export default async function BrowseCoursesPage() {
  await dbConnect()

  const courses = await Course.find({ status: 'published' })
    .select('_id title description thumbnail price currency level category')
    .sort({ createdAt: -1 })
    .lean()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Courses</h1>
        <p className="text-muted-foreground mt-1">
          Discover and enroll in our available courses
        </p>
      </div>

      {courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card 
              key={course._id.toString()} 
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
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2 text-lg">
                      {course.title}
                    </CardTitle>
                    {course.category && (
                      <Badge variant="secondary" className="mt-2">
                        {course.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="line-clamp-2 mt-2">
                  {course.description}
                </CardDescription>
              </CardHeader>

              {/* Course Footer */}
              <CardContent className="flex flex-col flex-grow justify-between gap-4 pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary">
                    {course.price}
                    <span className="text-sm text-muted-foreground ml-1">
                      {course.currency}
                    </span>
                  </div>
                  <Badge variant="outline">{course.level}</Badge>
                </div>

                <Link 
                  href={`/enroll/${course._id.toString()}`}
                  className="w-full"
                >
                  <Button className="w-full">Enroll Now</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No courses available</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-sm">
            No courses are currently available. Please check back later.
          </p>
        </div>
      )}
    </div>
  )
}
