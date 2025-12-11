import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { getCourseById } from '@/actions/courses/getCourseById'
import { UserRole } from '@/db/models/UserModel'
import { CourseContentManager } from './components/CourseContentManager'

interface ContentPageProps {
  params: Promise<{
    courseId: string
  }>
}

export default async function CourseContentPage({ params }: ContentPageProps) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    redirect('/')
  }

  const { courseId } = await params

  const result = await getCourseById(courseId)

  if (!result.success || !result.data) {
    notFound()
  }

  const course = result.data

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Course Content</h1>
        <p className="text-muted-foreground mt-2">
          {course.title}
        </p>
      </div>

      <CourseContentManager course={course} />
    </div>
  )
}

