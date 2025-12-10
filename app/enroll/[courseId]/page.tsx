import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Course } from '@/db/models/CourseModel'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EnrollPageProps {
  params: Promise<{
    courseId: string
  }>
}

export async function generateMetadata({ params }: EnrollPageProps) {
  const { courseId } = await params

  try {
    await dbConnect()
    const course = await Course.findById(courseId)

    if (!course) {
      return { title: 'Course not found' }
    }

    return {
      title: `Enroll: ${course.title}`,
      description: `Enroll in ${course.title}`,
    }
  } catch {
    return { title: 'Enrollment' }
  }
}

export default async function EnrollPage({ params }: EnrollPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    notFound()
  }

  const { courseId } = await params

  await dbConnect()

  const course = await Course.findById(courseId)

  if (!course) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Enrollment
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete your enrollment for {course.title}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-semibold">{course.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold">
                  {course.price}
                  <span className="text-sm text-muted-foreground ml-1">
                    {course.currency}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Enrollment page content coming soon. Payment and enrollment features will be implemented here.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link href={`/courses/${courseId}`} className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Back to Course
              </Button>
            </Link>
            <Link href="/explore" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Back to Explore
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
