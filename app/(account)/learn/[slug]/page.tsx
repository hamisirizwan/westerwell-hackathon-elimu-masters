import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { getCourseForLearning } from '@/actions/courses/getCourseForLearning'
import { SelfPacedLearning } from './components/SelfPacedLearning'
import { LiveLearning } from './components/LiveLearning'

interface LearnPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function LearnPage({ params }: LearnPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const { slug } = await params

  const result = await getCourseForLearning(slug)

  if (!result.success || !result.data) {
    if (result.message?.includes('not enrolled')) {
      redirect(`/courses/${slug}`)
    }
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Access Course</h1>
        </div>
        <div className="rounded-lg border p-6 text-center">
          <p className="text-muted-foreground">{result.message || 'Failed to load course content'}</p>
        </div>
      </div>
    )
  }

  const { course, enrollment, modules, sessions } = result.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="text-muted-foreground mt-2">
          {course.description || 'Continue your learning journey'}
        </p>
      </div>

      {course.courseType === 'self-paced' ? (
        <SelfPacedLearning course={course} modules={modules} />
      ) : (
        <LiveLearning course={course} sessions={sessions} />
      )}
    </div>
  )
}

