import { Course } from '@/db/models/CourseModel'
import dbConnect from '@/db/dbConnect'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Explore Courses',
  description: 'Browse our available courses and start learning today',
}

export default async function ExplorePage() {
  await dbConnect()

  const courses = await Course.find({ status: 'published' })
    .select('_id title description thumbnail price currency level category')
    .sort({ createdAt: -1 })
    .lean()

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Explore Courses
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl">
            Discover our available courses and start your learning journey today.
          </p>
        </div>

        {/* Courses Grid */}
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
                    href={`/courses/${course._id.toString()}`}
                    className="w-full"
                  >
                    <Button className="w-full">View Course</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground text-lg">
                No courses available yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}