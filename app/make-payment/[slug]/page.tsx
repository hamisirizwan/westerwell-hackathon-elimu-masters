import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { getCourseBySlug } from '@/actions/courses/getCourseBySlug'
import { getEnrollmentByCourseAndStudent } from '@/actions/enrollments/getEnrollmentByCourseAndStudent'
import { Metadata } from 'next'
import { PaymentWizard } from './components/PaymentWizard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

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
    title: `Make Payment: ${result.data.title}`,
    description: `Make a payment for ${result.data.title}`,
  }
}

export default async function MakePaymentPage({ params }: Props) {
  const session = await auth()

  if (!session?.user?.id) {
    notFound()
  }

  const { slug } = await params
  const courseResult = await getCourseBySlug(slug)

  if (!courseResult.success || !courseResult.data) {
    notFound()
  }

  const course = courseResult.data

  // Check for existing enrollment
  const enrollmentResult = await getEnrollmentByCourseAndStudent(course.id)

  if (!enrollmentResult.success || !enrollmentResult.data || enrollmentResult.data.isFullyPaid) {
    // If no enrollment or fully paid, redirect to enrollment page
    notFound()
  }

  const enrollment = enrollmentResult.data

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/finance">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Finance
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Make Payment
          </h1>
          <p className="text-muted-foreground">
            {course.title}
          </p>
        </div>

        <PaymentWizard
          courseId={course.id}
          courseSlug={course.slug}
          courseTitle={course.title}
          enrollmentId={enrollment.id}
          outstandingBalance={enrollment.balance}
          enrollmentCurrency={enrollment.currency}
        />
      </div>
    </div>
  )
}

