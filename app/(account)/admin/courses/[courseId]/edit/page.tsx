import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import dbConnect from '@/db/dbConnect'
import { Course } from '@/db/models/CourseModel'
import { CourseForm } from '@/app/(account)/admin/courses/components/CourseForm'

interface EditCoursePageProps {
  params: Promise<{
    courseId: string
  }>
}

export async function generateMetadata({ params }: EditCoursePageProps) {
  const { courseId } = await params

  try {
    await dbConnect()
    const course = await Course.findById(courseId)

    if (!course) {
      return { title: 'Course not found' }
    }

    return {
      title: `Edit: ${course.title}`,
    }
  } catch {
    return { title: 'Edit Course' }
  }
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    return <div>Unauthorized</div>
  }

  const { courseId } = await params

  await dbConnect()

  const course = await Course.findById(courseId)

  if (!course) {
    notFound()
  }

  // You can add authorization check here if needed
  // if (course.instructor.toString() !== session.user.id && session.user.role !== 'admin') {
  //   return <div>Unauthorized</div>
  // }

  const courseData = {
    id: course._id.toString(),
    title: course.title,
    description: course.description || undefined,
    thumbnail: course.thumbnail || undefined,
    courseType: course.courseType as 'self-paced' | 'live',
    price: course.price,
    currency: course.currency,
    category: course.category || undefined,
    level: course.level,
    language: course.language,
    estimatedDuration: course.estimatedDuration || undefined,
    learningOutcomes: course.learningOutcomes || [],
    requirements: course.requirements || [],
    status: course.status as 'draft' | 'published',
    startDate: course.startDate?.toISOString() || undefined,
    endDate: course.endDate?.toISOString() || undefined,
    maxStudents: course.maxStudents || undefined,
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
        <p className="text-muted-foreground mt-2">
          Update your course information below.
        </p>
      </div>

      <CourseForm mode="edit" initialData={courseData} />
    </div>
  )
}
