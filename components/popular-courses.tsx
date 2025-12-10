import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Course } from '@/db/models/CourseModel'
import dbConnect from '@/db/dbConnect'
import { ArrowRight } from 'lucide-react'

export async function PopularCourses() {
  await dbConnect()

  // Get popular courses (most enrolled or recently published)
  const courses = await Course.find({ status: 'published' })
    .select('_id title slug description thumbnail price currency level category courseType enrollmentCount')
    .sort({ enrollmentCount: -1, createdAt: -1 })
    .limit(6)
    .lean()

  if (courses.length === 0) {
    return null
  }

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Popular Courses
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular courses loved by students across Africa
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {courses.map((course) => (
            <Card 
              key={course._id.toString()} 
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group"
            >
              {/* Course Thumbnail */}
              {course.thumbnail && (
                <div className="relative w-full h-48 overflow-hidden bg-muted">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                    {course.price === 0 ? 'Free' : (
                      <>
                        {course.price}
                        <span className="text-sm text-muted-foreground ml-1">
                          {course.currency}
                        </span>
                      </>
                    )}
                  </div>
                  <Badge variant="outline" className="capitalize">{course.level}</Badge>
                </div>

                <Link href={`/courses/${course.slug}`} className="w-full">
                  <Button className="w-full" variant="outline">
                    View Course
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/explore" className="inline-flex items-center gap-2">
              View All Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

