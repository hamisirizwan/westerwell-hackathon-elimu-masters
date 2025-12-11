import { getCourseBySlug } from "@/actions/courses/getCourseBySlug"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Clock, 
  BookOpen, 
  Users, 
  Globe, 
  CheckCircle2,
  PlayCircle,
  Video,
  Calendar,
} from "lucide-react"
import { Metadata } from "next"
import { auth } from "@/lib/auth/auth"
import { EnrollButton } from "./components/EnrollButton"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getCourseBySlug(slug)

  if (!result.success || !result.data) {
    return {
      title: 'Course Not Found',
    }
  }

  return {
    title: result.data.title,
    description: result.data.description || `Learn ${result.data.title} on Elimu Masters`,
  }
}

export default async function CourseDetailsPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()
  const result = await getCourseBySlug(slug)

  if (!result.success || !result.data) {
    notFound()
  }

  const course = result.data
  const isLoggedIn = !!session?.user

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free'
    return `${currency} ${price.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-muted/50 border-b">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="space-y-8">
            {/* Course Thumbnail */}
            {course.thumbnail && (
              <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-muted">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Course Info */}
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {course.category && (
                  <Badge variant="secondary">{course.category}</Badge>
                )}
                <Badge variant="outline" className="capitalize">{course.level}</Badge>
                <Badge variant="outline">
                  {course.courseType === 'live' ? (
                    <><Video className="h-3 w-3 mr-1" /> Live Course</>
                  ) : (
                    <><PlayCircle className="h-3 w-3 mr-1" /> Self-paced</>
                  )}
                </Badge>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                {course.title}
              </h1>

              {course.description && (
                <p className="text-lg text-muted-foreground">
                  {course.description}
                </p>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                {course.totalDuration > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(course.totalDuration)}</span>
                  </div>
                )}
                {course.courseType === 'self-paced' && course.totalLessons > 0 && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.totalLessons} lessons</span>
                  </div>
                )}
                {course.courseType === 'live' && course.totalSessions > 0 && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{course.totalSessions} sessions</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{course.language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{course.enrollmentCount} enrolled</span>
                </div>
              </div>

              {course.instructor && (
                <p className="text-sm">
                  Instructor: <span className="font-medium">{course.instructor.username}</span>
                </p>
              )}

              {/* What you'll learn */}
              {course.learningOutcomes.length > 0 && (
                <section className="pt-4">
                  <h2 className="text-xl font-bold mb-4">What you&apos;ll learn</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {course.learningOutcomes.map((outcome: string, index: number) => (
                      <div key={index} className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <div className="space-y-12">
          {/* Requirements */}
          {course.requirements.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Requirements</h2>
              <ul className="space-y-2">
                {course.requirements.map((req, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-muted-foreground">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Course Curriculum (Self-paced) */}
          {course.courseType === 'self-paced' && course.modules.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
              <div className="space-y-4">
                {course.modules.map((module) => (
                  <Card key={module.id}>
                    <CardHeader className="py-4">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{module.title}</span>
                        <span className="text-sm font-normal text-muted-foreground">
                          {module.lessons.length} lessons
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4">
                      <ul className="space-y-2">
                        {module.lessons.map((lesson) => (
                          <li 
                            key={lesson.id} 
                            className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <PlayCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{lesson.title}</span>
                              {lesson.isFreePreview && (
                                <Badge variant="secondary" className="text-xs">Preview</Badge>
                              )}
                            </div>
                            {lesson.duration && (
                              <span className="text-sm text-muted-foreground">
                                {formatDuration(lesson.duration)}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Schedule (Live courses) */}
          {course.courseType === 'live' && course.sessions.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Course Schedule</h2>
              <div className="space-y-3">
                {course.sessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Video className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{session.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(session.scheduledAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(session.duration)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Floating Sticky Enroll Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold">
                  {formatPrice(course.price, course.currency)}
                </div>
                {course.courseType === 'live' && course.startDate && (
                  <div className="text-xs text-muted-foreground">
                    Starts {formatDate(course.startDate)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Certificate</span>
                </div>
              </div>
            </div>
            <div className="flex-1 sm:flex-none">
              <EnrollButton 
                courseSlug={course.slug}
                price={course.price}
                currency={course.currency}
                isLoggedIn={isLoggedIn}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

