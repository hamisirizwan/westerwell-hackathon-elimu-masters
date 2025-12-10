import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { getCourseBySlug } from '@/actions/courses/getCourseBySlug'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getCourseBySlug(slug)

  if (!result.success || !result.data) {
    return { title: 'Course not found' }
  }

  return {
    title: `Enroll: ${result.data.title}`,
    description: `Enroll in ${result.data.title}`,
  }
}

export default async function EnrollPage({ params }: Props) {
  const session = await auth()

  if (!session?.user?.id) {
    notFound()
  }

  const { slug } = await params
  const result = await getCourseBySlug(slug)

  if (!result.success || !result.data) {
    notFound()
  }

  const course = result.data

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free'
    return `${currency} ${price.toLocaleString()}`
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
                  {formatPrice(course.price, course.currency)}
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
            <Link href={`/courses/${course.slug}`} className="flex-1">
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

